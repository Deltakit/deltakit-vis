export type DeltakitViewName = 'Top' | 'Bottom' | 'Front' | 'Back' | 'Right' | 'Left';

export type DeltakitChangeViewEvent = CustomEvent<{ view: DeltakitViewName }>;
