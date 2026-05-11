import { GalleryProjectForm } from "./gallery-project-form";

export function GalleryAddProjectForm() {
  return <GalleryProjectForm mode="create" />;
}

export { GALLERY_PROJECT_MEDIA_PREFIX, GALLERY_UPLOAD_PUBLIC_DIR } from "./gallery-project-form";

export type { GalleryProjectFormProps } from "./gallery-project-form";
