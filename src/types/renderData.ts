import type { DirectionType } from '@/primitives/Direction';

export type Colour = 'RED' | 'BLUE' | 'GREY' | 'NONE';

export type Vec2 = [number, number];

interface BaseOp {
    id?: string | number;
}

export interface SurfaceOp extends BaseOp {
    type: "surface";
    op_name?: string;
    size: Vec2;
    location: Vec2;
    startHeight: number;
    colour: Colour;
}

export type Sides = { '+X': boolean; '-X': boolean; '+Y': boolean; '-Y': boolean };

export interface SideOp extends BaseOp {
    type: "side";
    op_name?: string;
    sides?: Sides;
    fromSurfaceId: string | number;
    toSurfaceId: string | number;
    colourScheme: Colour[];
}

export type Op = SurfaceOp | SideOp;

export interface RenderData {
    type?: "spacetime";
    ops: Op[];
    removeSurfaceFromAxis?: DirectionType;
}
