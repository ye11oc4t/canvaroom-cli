export interface Presenter {
  name: string;
  title: string;
  bio: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  avatarInitials: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
}

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface PresentationData {
  title: string;
  canvaUrl: string;
  slidoUrl: string;
  presenter: Presenter;
  chapters: Chapter[];
  links: Link[];
}
