export interface QubitData {
  id: string;
  type?: 'data' | 'ancilla';
  coordinates: [number, number];
}

export interface PlaquetteData {
  id: number;
  weight: number;
  shape: 'square' | 'semicircle';
  coordinates: string[];
  colour: 'red' | 'blue';
}

export interface PatchData {
  plaquettes: PlaquetteData[];
}

export interface PatchRenderData {
  round: number;
  qubits: QubitData[];
  patches: PatchData[];
}
