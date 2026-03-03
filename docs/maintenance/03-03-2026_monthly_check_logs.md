[u347029080@sg-nme-web423 public_html]$ composer audit
Found 4 security vulnerability advisories affecting 4 packages:
+-------------------+----------------------------------------------------------------------------------+
| Package           | firebase/php-jwt                                                                 |
| Severity          | low                                                                              |
| CVE               | CVE-2025-45769                                                                   |
| Title             | php-jwt contains weak encryption                                                 |
| URL               | https://github.com/advisories/GHSA-2x45-7fc3-mxwq                                |
| Affected versions | <7.0.0                                                                           |
| Reported at       | 2025-07-31T21:31:53+00:00                                                        |
+-------------------+----------------------------------------------------------------------------------+
+-------------------+----------------------------------------------------------------------------------+
| Package           | phpunit/phpunit                                                                  |
| Severity          | high                                                                             |
| CVE               | CVE-2026-24765                                                                   |
| Title             | PHPUnit Vulnerable to Unsafe Deserialization in PHPT Code Coverage Handling      |
| URL               | https://github.com/advisories/GHSA-vvj3-c3rp-c85p                                |
| Affected versions | >=12.0.0,<12.5.8|>=11.0.0,<11.5.50|>=10.0.0,<10.5.62|>=9.0.0,<9.6.33|<8.5.52     |
| Reported at       | 2026-01-27T22:26:22+00:00                                                        |
+-------------------+----------------------------------------------------------------------------------+
+-------------------+----------------------------------------------------------------------------------+
| Package           | psy/psysh                                                                        |
| Severity          | medium                                                                           |
| CVE               | CVE-2026-25129                                                                   |
| Title             | PsySH has Local Privilege Escalation via CWD .psysh.php auto-load                |
| URL               | https://github.com/advisories/GHSA-4486-gxhx-5mg7                                |
| Affected versions | <=0.11.22|>=0.12.0,<=0.12.18                                                     |
| Reported at       | 2026-01-30T21:28:44+00:00                                                        |
+-------------------+----------------------------------------------------------------------------------+
+-------------------+----------------------------------------------------------------------------------+
| Package           | symfony/process                                                                  |
| Severity          | medium                                                                           |
| CVE               | CVE-2026-24739                                                                   |
| Title             | Symfony's incorrect argument escaping under MSYS2/Git Bash can lead to           |
|                   | destructive file operations on Windows                                           |
| URL               | https://github.com/advisories/GHSA-r39x-jcww-82v6                                |
| Affected versions | >=8.0,<8.0.5|>=7.4,<7.4.5|>=7.3,<7.3.11|>=6.4,<6.4.33|<5.4.51                    |
| Reported at       | 2026-01-28T21:28:10+00:00                                                        |
+-------------------+----------------------------------------------------------------------------------+
[u347029080@sg-nme-web423 public_html]$


[u347029080@sg-nme-web423 public_html]$ npm audit
# npm audit report

ajv  <6.14.0
Severity: moderate
ajv has ReDoS when using `$data` option - https://github.com/advisories/GHSA-2g4f-4pwh-qvx6
fix available via `npm audit fix`
node_modules/ajv

axios  1.0.0 - 1.13.4
Severity: high
Axios is Vulnerable to Denial of Service via __proto__ Key in mergeConfig - https://github.com/advisories/GHSA-43fc-jf86-j433
fix available via `npm audit fix`
node_modules/axios

minimatch  <=3.1.3 || 9.0.0 - 9.0.6
Severity: high
minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern - https://github.com/advisories/GHSA-3ppc-4f35-3m26
minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern - https://github.com/advisories/GHSA-3ppc-4f35-3m26
minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments - https://github.com/advisories/GHSA-7r86-cg39-jmmj
minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments - https://github.com/advisories/GHSA-7r86-cg39-jmmj
minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions - https://github.com/advisories/GHSA-23c5-xmqv-rm74
minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions - https://github.com/advisories/GHSA-23c5-xmqv-rm74
fix available via `npm audit fix`
node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch
node_modules/minimatch

qs  6.7.0 - 6.14.1
qs's arrayLimit bypass in comma parsing allows denial of service - https://github.com/advisories/GHSA-w7fw-mjwx-w883
fix available via `npm audit fix`
node_modules/qs

rollup  4.0.0 - 4.58.0
Severity: high
Rollup 4 has Arbitrary File Write via Path Traversal - https://github.com/advisories/GHSA-mw96-cpmx-2vgc
fix available via `npm audit fix`
node_modules/rollup

tar  <7.5.8
Severity: high
Arbitrary File Read/Write via Hardlink Target Escape Through Symlink Chain in node-tar Extraction - https://github.com/advisories/GHSA-83g3-92jg-28cx
fix available via `npm audit fix`
node_modules/tar

6 vulnerabilities (1 low, 1 moderate, 4 high)

To address all issues, run:
  npm audit fix


[u347029080@sg-nme-web423 public_html]$ composer require --dev roave/security-advisories:dev-latest
./composer.json has been updated
Running composer update roave/security-advisories
Loading composer repositories with package information
Updating dependencies
Your requirements could not be resolved to an installable set of packages.

  Problem 1
    - laravel/socialite is locked to version v5.23.1 and an update of this package was not requested.
    - Root composer.json requires roave/security-advisories dev-latest -> satisfiable by roave/security-advisories[dev-latest].
    - laravel/socialite v5.23.1 requires firebase/php-jwt ^6.4 -> satisfiable by firebase/php-jwt[v6.11.1].
    - roave/security-advisories dev-latest conflicts with firebase/php-jwt <7.


Installation failed, reverting ./composer.json and ./composer.lock to their original content.
[u347029080@sg-nme-web423 public_html]$


[u347029080@sg-nme-web423 public_html]$ npm update

added 19 packages, removed 65 packages, changed 133 packages, and audited 558 packages in 38s

164 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
[u347029080@sg-nme-web423 public_html]$


