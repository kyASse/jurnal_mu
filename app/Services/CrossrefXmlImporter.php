<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Journal;
use Illuminate\Support\Facades\Log;

class CrossrefXmlImporter
{
    public function import(Journal $journal, string $filePath, string $strategy): array
    {
        $stats = [
            'records_found' => 0,
            'records_imported' => 0,
            'records_updated' => 0,
        ];

        $xmlContent = file_get_contents($filePath);
        $cleanXml = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $xmlContent);
        
        $xml = simplexml_load_string($cleanXml);
        if ($xml === false) {
            throw new \Exception("Gagal memproses file XML. Format tidak valid.");
        }

        $xml->registerXPathNamespace('cr', 'http://www.crossref.org/schema/4.3.6');
        $xml->registerXPathNamespace('jats', 'http://www.ncbi.nlm.nih.gov/JATS1');
        $xml->registerXPathNamespace('ai', 'http://www.crossref.org/AccessIndicators.xsd');

        $journalNodes = $xml->xpath('//cr:journal') ?: $xml->xpath('//journal');
        if (empty($journalNodes)) {
            throw new \Exception("File XML tidak mengandung elemen <journal>.");
        }

        foreach ($journalNodes as $journalNode) {
            $journalNode->registerXPathNamespace('cr', 'http://www.crossref.org/schema/4.3.6');
            $journalNode->registerXPathNamespace('jats', 'http://www.ncbi.nlm.nih.gov/JATS1');
            $journalNode->registerXPathNamespace('ai', 'http://www.crossref.org/AccessIndicators.xsd');

            $volumeNode = $journalNode->xpath('.//cr:journal_volume/cr:volume') ?: $journalNode->xpath('.//journal_volume/volume');
            $issueNode = $journalNode->xpath('.//cr:journal_issue/cr:issue') ?: $journalNode->xpath('.//journal_issue/issue');
            $volume = $volumeNode ? trim((string)$volumeNode[0]) : null;
            $issue = $issueNode ? trim((string)$issueNode[0]) : null;

            $issueDateNode = $journalNode->xpath('.//cr:journal_issue/cr:publication_date') ?: $journalNode->xpath('.//journal_issue/publication_date');
            $issuePubDate = isset($issueDateNode[0]) ? $this->parseDateNode($issueDateNode[0]) : null;

            $articleNodes = $journalNode->xpath('.//cr:journal_article') ?: $journalNode->xpath('.//journal_article');
            $stats['records_found'] += count($articleNodes);

            foreach ($articleNodes as $articleNode) {
                $articleNode->registerXPathNamespace('cr', 'http://www.crossref.org/schema/4.3.6');
                $articleNode->registerXPathNamespace('jats', 'http://www.ncbi.nlm.nih.gov/JATS1');
                $articleNode->registerXPathNamespace('ai', 'http://www.crossref.org/AccessIndicators.xsd');

                $titleNode = $articleNode->xpath('.//cr:titles/cr:title') ?: $articleNode->xpath('.//titles/title');
                $title = $titleNode ? trim((string)$titleNode[0]) : null;
                if (!$title) {
                    continue;
                }

                $abstractNode = $articleNode->xpath('.//jats:abstract/jats:p') ?: $articleNode->xpath('.//abstract/jats:p') ?: $articleNode->xpath('.//cr:abstract/cr:p') ?: $articleNode->xpath('.//abstract');
                $abstract = null;
                if ($abstractNode) {
                    $abstract = trim(strip_tags((string)$abstractNode[0]));
                }

                $authorNodes = $articleNode->xpath('.//cr:contributors/cr:person_name[@contributor_role="author"]') ?: $articleNode->xpath('.//contributors/person_name[@contributor_role="author"]');
                $authors = [];
                if ($authorNodes) {
                    foreach ($authorNodes as $authorNode) {
                        $authorNode->registerXPathNamespace('cr', 'http://www.crossref.org/schema/4.3.6');
                        $given = trim((string)($authorNode->xpath('.//cr:given_name') ?: $authorNode->xpath('.//given_name'))[0] ?? '');
                        $surname = trim((string)($authorNode->xpath('.//cr:surname') ?: $authorNode->xpath('.//surname'))[0] ?? '');
                        $fullName = trim("{$given} {$surname}");
                        if ($fullName !== '') {
                            $authors[] = $fullName;
                        }
                    }
                }

                $doiNode = $articleNode->xpath('.//cr:doi_data/cr:doi') ?: $articleNode->xpath('.//doi_data/doi');
                $doi = $doiNode ? trim((string)$doiNode[0]) : null;

                $urlNode = $articleNode->xpath('.//cr:doi_data/cr:resource') ?: $articleNode->xpath('.//doi_data/resource');
                $articleUrl = $urlNode ? trim((string)$urlNode[0]) : null;

                $pdfNode = $articleNode->xpath('.//cr:doi_data/cr:collection[@property="text-mining"]/cr:item/cr:resource') ?:
                           $articleNode->xpath('.//doi_data/collection[@property="text-mining"]/item/resource') ?:
                           $articleNode->xpath('.//cr:doi_data/cr:collection/cr:item/cr:resource') ?:
                           $articleNode->xpath('.//doi_data/collection/item/resource');
                $pdfUrl = $pdfNode ? trim((string)$pdfNode[0]) : null;

                $firstPageNode = $articleNode->xpath('.//cr:pages/cr:first_page') ?: $articleNode->xpath('.//pages/first_page');
                $lastPageNode = $articleNode->xpath('.//cr:pages/cr:last_page') ?: $articleNode->xpath('.//pages/last_page');
                $otherPagesNode = $articleNode->xpath('.//cr:pages/cr:other_pages') ?: $articleNode->xpath('.//pages/other_pages');
                $pages = null;
                if ($firstPageNode) {
                    $first = trim((string)$firstPageNode[0]);
                    $last = $lastPageNode ? trim((string)$lastPageNode[0]) : '';
                    $pages = $last !== '' ? "{$first}-{$last}" : $first;
                } elseif ($otherPagesNode) {
                    $pages = trim((string)$otherPagesNode[0]);
                }

                $articleDateNode = $articleNode->xpath('.//cr:publication_date') ?: $articleNode->xpath('.//publication_date');
                $pubDate = (isset($articleDateNode[0]) ? $this->parseDateNode($articleDateNode[0]) : null) ?: $issuePubDate ?: now()->toDateString();

                $oaiIdentifier = $doi ? "xml:{$doi}" : "xml:{$journal->id}-" . md5($title);

                $existing = null;
                if ($doi) {
                    $existing = Article::where('journal_id', $journal->id)
                        ->where(function ($query) use ($doi, $oaiIdentifier) {
                            $query->where('doi', $doi)
                                  ->orWhere('oai_identifier', $oaiIdentifier);
                        })->first();
                } else {
                    $existing = Article::where('journal_id', $journal->id)
                        ->where('oai_identifier', $oaiIdentifier)
                        ->first();
                }

                $articleData = [
                    'journal_id' => $journal->id,
                    'oai_identifier' => $oaiIdentifier,
                    'oai_datestamp' => now(),
                    'title' => $title,
                    'abstract' => $abstract,
                    'authors' => $authors,
                    'doi' => $doi,
                    'publication_date' => $pubDate,
                    'volume' => $volume,
                    'issue' => $issue,
                    'pages' => $pages,
                    'article_url' => $articleUrl,
                    'pdf_url' => $pdfUrl,
                    'last_harvested_at' => now(),
                ];

                if ($existing) {
                    if ($strategy === 'update') {
                        $existing->update($articleData);
                        $stats['records_updated']++;
                    }
                } else {
                    Article::create($articleData);
                    $stats['records_imported']++;
                }
            }
        }

        return $stats;
    }

    private function parseDateNode($dateNode): ?string
    {
        if (!$dateNode) {
            return null;
        }
        if ($dateNode instanceof \SimpleXMLElement) {
            $dateNode->registerXPathNamespace('cr', 'http://www.crossref.org/schema/4.3.6');
        }
        $yearNode = $dateNode->xpath('.//cr:year') ?: $dateNode->xpath('.//year');
        $monthNode = $dateNode->xpath('.//cr:month') ?: $dateNode->xpath('.//month');
        $dayNode = $dateNode->xpath('.//cr:day') ?: $dateNode->xpath('.//day');

        $year = $yearNode ? trim((string)$yearNode[0]) : null;
        $month = $monthNode ? str_pad(trim((string)$monthNode[0]), 2, '0', STR_PAD_LEFT) : '01';
        $day = $dayNode ? str_pad(trim((string)$dayNode[0]), 2, '0', STR_PAD_LEFT) : '01';

        if ($year) {
            return "{$year}-{$month}-{$day}";
        }
        return null;
    }
}
