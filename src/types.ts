export type IconName = 'terminal' | 'box' | 'cloud' | 'alert-triangle' | 'cpu' | 'layers';

export interface Section {
  id: string;
  title: string;
  content: string;
  code?: string;
  language?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  sections: Section[];
}
