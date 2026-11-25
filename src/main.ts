import type { RenderData } from '@/types/renderData';
import Deltakit from './index';

// Create sample data that renders CNOT space-time graph
const data: RenderData = {
"type": "spacetime",
"ops": [
        {
            "type": "surface",
            "id": "lq_p",
            "op_name": "log_asm.prepare",
            "location": [
                0,
                0
            ],
            "colour": "BLUE",
            "size": [
                3,
                3
            ],
            "startHeight": 0
        },
        {
            "type": "side",
            "op_name": "log_asm.meas_stab",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": true,
                "-X": true,
                "+Y": true,
                "-Y": true
            },
            "fromSurfaceId": "lq_p",
            "toSurfaceId": "none_1"
        },
        {
            "type": "surface",
            "id": "none_1",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                0,
                0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 3
        },
        {
            "type": "hadamard",
            "id": "lq_h",
            "op_name": "log_asm.transversal",
            "startHeight": 3.0,
            "height": 0,
            "location": [
                0.0,
                0.0
            ],
            "size": [
                3,
                3
            ]
        },
        {
            "type": "surface",
            "id": "none_1_1",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                0,
                0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 4
        },
        {
            "type": "side",
            "op_name": "log_asm.meas_stab",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": true,
                "-X": true,
                "+Y": true,
                "-Y": true
            },
            "fromSurfaceId": "none_1_1",
            "toSurfaceId": "none_2"
        },
        {
            "type": "surface",
            "id": "none_2",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                0,
                0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 7
        },
    ]
};

const deltakit = new Deltakit('app');
deltakit.render(data);
