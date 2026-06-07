# Search Dropdown and Rotating Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the welcome page search bar to support scope-based search (Journals, Articles, Universities) using a Radix dropdown menu and animate the "Can't find what you're looking for?" link section by rotating between destinations using a fade-and-slide transition.

**Architecture:** Use `@/components/ui/dropdown-menu` for the custom select component inside the rounded search container, handle route redirections dynamically in `welcome.tsx`, and manage rotation via a `useEffect` interval hook.

**Tech Stack:** React 18, TypeScript, Inertia.js, Tailwind CSS.

---

### Task 1: Search Scope Dropdown Selector

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Update React and Lucide imports**
  Add `useEffect` to React import and add `ChevronDown` to `lucide-react` imports. Also import the custom dropdown menu components:
  ```tsx
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
  import { ArrowRight, BookOpen, Calendar, Clock, GraduationCap, LayoutDashboard, Library, MapPin, Search, User, ChevronDown } from 'lucide-react';
  import { useState, useEffect } from 'react';
  ```

- [ ] **Step 2: Add searchType state and update handleSearch function**
  Define `searchType` state in the `Welcome` component (line 72 onwards) and update `handleSearch` to route search requests conditionally:
  ```tsx
      const [searchQuery, setSearchQuery] = useState('');
      const [searchType, setSearchType] = useState<'journals' | 'articles' | 'universities'>('journals');

      const handleSearch = () => {
          if (!searchQuery.trim()) return;

          if (searchType === 'journals') {
              window.location.href = route('journals.index', { search: searchQuery });
          } else if (searchType === 'articles') {
              window.location.href = route('browse.articles', { q: searchQuery });
          } else if (searchType === 'universities') {
              window.location.href = route('browse.universities', { search: searchQuery });
          }
      };
  ```

- [ ] **Step 3: Replace Search Bar layout in TSX**
  Modify the Search Bar HTML block (around lines 112-130) with the flex-based row container and drop-down menu selector:
  ```tsx
                          {/* Search Bar */}
                          <div className="mx-auto max-w-2xl">
                              <div className="relative flex items-center rounded-full bg-white shadow-2xl p-1.5 pl-4 focus-within:ring-4 focus-within:ring-[#FCEE1F]/50">
                                  <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                  <input
                                      type="text"
                                      placeholder={
                                          searchType === 'journals'
                                              ? "Search for journals, publisher, or ISSN..."
                                              : searchType === 'articles'
                                              ? "Search for article title, author, or abstract..."
                                              : "Search for university name or code..."
                                      }
                                      className="h-11 w-full border-0 bg-transparent px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:ring-offset-0 sm:text-base"
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                  />
                                  
                                  {/* Divider */}
                                  <div className="h-6 w-[1px] bg-gray-200 mx-2 flex-shrink-0" />

                                  {/* Dropdown Selector */}
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <button
                                              type="button"
                                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-50 focus:outline-none transition-colors mr-2 flex-shrink-0"
                                          >
                                              {searchType === 'journals' && <Library className="h-4 w-4 text-gray-500" />}
                                              {searchType === 'articles' && <BookOpen className="h-4 w-4 text-gray-500" />}
                                              {searchType === 'universities' && <GraduationCap className="h-4 w-4 text-gray-500" />}
                                              <span className="capitalize">{searchType}</span>
                                              <ChevronDown className="h-4 w-4 text-gray-400" />
                                          </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40">
                                          <DropdownMenuItem onClick={() => setSearchType('journals')} className="cursor-pointer flex items-center gap-2">
                                              <Library className="h-4 w-4 text-gray-400" />
                                              <span>Journals</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => setSearchType('articles')} className="cursor-pointer flex items-center gap-2">
                                              <BookOpen className="h-4 w-4 text-gray-400" />
                                              <span>Articles</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => setSearchType('universities')} className="cursor-pointer flex items-center gap-2">
                                              <GraduationCap className="h-4 w-4 text-gray-400" />
                                              <span>Universities</span>
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>

                                  <Button
                                      className="h-11 rounded-full bg-[#1A2A75] px-6 text-white hover:bg-[#131f57] flex-shrink-0"
                                      onClick={handleSearch}
                                  >
                                      Search
                                  </Button>
                              </div>
  ```

- [ ] **Step 4: Commit search bar selector changes**
  Run:
  ```bash
  git add resources/js/pages/welcome.tsx
  git commit -m "feat: add search scope dropdown selector to homepage search input"
  ```

---

### Task 2: Rotating Browse Links Section

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] **Step 1: Implement custom links timer state and effect**
  Declare rotating links metadata list and lifecycle hooks inside `Welcome` component (right below searchType state):
  ```tsx
      const links = [
          { label: 'Browse Journals', href: route('journals.index') },
          { label: 'Browse Articles', href: route('browse.articles') },
          { label: 'Browse Universities', href: route('browse.universities') },
      ];

      const [currentLinkIndex, setCurrentLinkIndex] = useState(0);
      const [isFading, setIsFading] = useState(false);

      useEffect(() => {
          const interval = setInterval(() => {
              setIsFading(true);
              setTimeout(() => {
                  setCurrentLinkIndex((prev) => (prev + 1) % links.length);
                  setIsFading(false);
              }, 300);
          }, 4000);

          return () => clearInterval(interval);
      }, []);
  ```

- [ ] **Step 2: Replace "Can't find what you're looking for?" HTML block**
  Locate the footer links block below the search bar container (around lines 131-137) and replace with the transition-enabled rotating links block:
  ```tsx
                              <div className="mt-4 flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-sm text-emerald-100">
                                  <span>Can't find what you're looking for?</span>
                                  <div className="h-5 overflow-hidden inline-flex items-center">
                                      <Link
                                          href={links[currentLinkIndex].href}
                                          className={`font-semibold text-[#FCEE1F] hover:underline transition-all duration-300 ease-out inline-flex items-center ${
                                              isFading ? 'opacity-0 translate-y-3 scale-95' : 'opacity-100 translate-y-0 scale-100'
                                          }`}
                                      >
                                          {links[currentLinkIndex].label}
                                      </Link>
                                  </div>
                              </div>
  ```

- [ ] **Step 3: Commit rotating links changes**
  Run:
  ```bash
  git add resources/js/pages/welcome.tsx
  git commit -m "feat: animate footer links block with rolling destinations using fade-slide transition"
  ```

---

### Task 3: Build Verification

- [ ] **Step 1: Run npm build to verify production assets compile without error**
  Run:
  ```bash
  npm run build
  ```
  Expected: Success.
