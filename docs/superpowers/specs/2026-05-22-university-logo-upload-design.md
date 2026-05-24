# University Logo Upload Feature Design

Enhance the university edit forms in both Admin and AdminKampus panels to support premium drag-and-drop logo file uploads instead of plain text URL inputs.

## Proposed Changes

### Frontend

#### Admin Panel Edit Page (`resources/js/pages/Admin/Universities/Edit.tsx`)
- Add `logo_file` field to `useForm` (initially `null`).
- Update form submission to use `post` method with `_method: 'put'` to support multipart file upload.
- Implement an interactive drag-and-drop file upload zone (Dropzone) with:
  - File validation (image formats only).
  - Immediate preview of the selected image.
  - Reset/Clear option.

#### AdminKampus Panel Edit Page (`resources/js/pages/AdminKampus/University/Edit.tsx`)
- Add `logo_file` field to `useForm` (initially `null`).
- Update form submission to use `post` method with `_method: 'put'`.
- Implement the same drag-and-drop file upload zone (Dropzone) matching the design system.

### Backend

#### Admin UniversityController (`app/Http/Controllers/Admin/UniversityController.php`)
- Update `update` method:
  - Validate `logo_file` as an image (jpeg, png, jpg, gif, max 2MB).
  - Handle file storage using `Storage::disk('public')`.
  - Delete existing logo from storage if a new one is uploaded.
  - Save path to `logo_url` field.

#### AdminKampus UniversityController (`app/Http/Controllers/AdminKampus/UniversityController.php`)
- Update validation in `update` method:
  - Allow `logo_file` and all the other missing fields: `short_name`, `city`, `province`, `postal_code`, `accreditation_status`, `cluster`.
  - Validate `logo_file` as an image.
  - Handle file storage, deletion of old logo, and saving path to `logo_url`.
  - Ensure other new fields are saved properly to database!

## Verification Plan

### Automated/Manual tests
- Verify that a logo image can be dragged and dropped or selected via file picker.
- Verify that the image preview displays correctly.
- Verify that saving the form uploads the file, saves the path to the DB, and shows the updated logo after redirect.
- Verify validation works (e.g. rejecting non-image files or files > 2MB).
