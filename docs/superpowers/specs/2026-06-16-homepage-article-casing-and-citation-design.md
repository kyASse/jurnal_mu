# Homepage Article Casing and Citation Export Design

This design specifies the implementation details for improving the homepage Featured Articles section:
1. Converting all-caps article titles to Title Case.
2. Adding DOI and Export RIS buttons to match the main article list page.

## Proposed Changes

### Backend

#### [PublicHomeService.php](file:///c:/xampp/htdocs/jurnal_mu/app/Services/PublicHomeService.php)
- Implement a title case formatting method `toTitleCaseIfAllUpper` that handles Indonesian and English minor words.
- Update `getFeaturedArticles` query mapper to:
  - Apply `toTitleCaseIfAllUpper` to `title`.
  - Add fields `authors`, `volume`, `issue`, `pages`, `doi`, `doi_url`, `abstract` to the mapped array.

### Frontend

#### [welcome.tsx](file:///c:/xampp/htdocs/jurnal_mu/resources/js/pages/welcome.tsx)
- Import `FileText` and `Download` icons from `lucide-react`.
- Update typescript interface `WelcomeProps` for `featuredArticles` to include citation attributes.
- Implement the `downloadRis` citation generator function.
- Add DOI button (if `article.doi` is available) and Export RIS button.

## Verification Plan

### Automated Verification
- Verify that cache gets generated properly and no PHP compilation errors occur.
- Run tests on homepage rendering.

### Manual Verification
- Check the home page to verify titles are formatted correctly in Title Case.
- Check that the DOI link works.
- Click the "Export RIS" button and verify the `.ris` file is downloaded and has the correct fields.
