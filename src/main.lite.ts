import type { RenderData } from '@/types/renderData';
import Deltakit from './index.lite';

// Create sample data that renders prepare space-time graph
const data: RenderData = {
"type": "spacetime",
"ops": [
        {
            "type": "surface",
            "id": "lq_p",
            "op_name": "log_asm.prepare",
            "location": [
                1,
                1
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
                1,
                1
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 3
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
            "fromSurfaceId": "none_1",
            "toSurfaceId": "none_2"
        },
        {
            "type": "surface",
            "id": "none_2",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                1,
                1
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 6
        },
    ]
};

const deltakit = new Deltakit('app');
deltakit.render(data);
