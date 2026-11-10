import type { RenderData } from '@/types/renderData';
import Deltakit from './index';

// Create sample data that renders CNOT space-time graph
const data: RenderData = {
    "type": "spacetime",
    "ops": [
        {
            "type": "surface",
            "id": "patch_A_0_",
            "op_name": "log_asm.patch_dec",
            "location": [
                0.0,
                0.0
            ],
            "colour": "GREY",
            "size": [
                3,
                3
            ],
            "startHeight": 0.0
        },
        {
            "type": "surface",
            "id": "patch_B_0_",
            "op_name": "log_asm.patch_dec",
            "location": [
                4.0,
                4.0
            ],
            "colour": "GREY",
            "size": [
                3,
                3
            ],
            "startHeight": 0.0
        },
        {
            "type": "surface",
            "id": "patch_A_1_",
            "op_name": "log_asm.prepare",
            "location": [
                0.0,
                0.0
            ],
            "colour": "RED",
            "size": [
                3,
                3
            ],
            "startHeight": 0.0
        },
        {
            "type": "surface",
            "id": "patch_B_1_",
            "op_name": "log_asm.prepare",
            "location": [
                4.0,
                4.0
            ],
            "colour": "RED",
            "size": [
                3,
                3
            ],
            "startHeight": 0.0
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_0:patch_A_2_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_1:patch_B_2_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "surface",
            "id": "gen_id_0",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                0.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 0.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_0:patch_A_2_",
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
            "fromSurfaceId": "gen_id_0",
            "toSurfaceId": "patch_A_2_"
        },
        {
            "type": "surface",
            "id": "patch_A_2_",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                0.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 3.0
        },
        {
            "type": "surface",
            "id": "gen_id_1",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                4.0,
                4.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 3.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_1:patch_B_2_",
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
            "fromSurfaceId": "gen_id_1",
            "toSurfaceId": "patch_B_2_"
        },
        {
            "type": "surface",
            "id": "patch_B_2_",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                4.0,
                4.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 6.0
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_0:patch_A_2_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_1:patch_B_2_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "surface",
            "id": "patch_C_1_",
            "op_name": "log_asm.patch_dec",
            "location": [
                4.0,
                0.0
            ],
            "colour": "GREY",
            "size": [
                3,
                3
            ],
            "startHeight": 6.0
        },
        {
            "type": "surface",
            "id": "patch_C_2_",
            "op_name": "log_asm.prepare",
            "location": [
                4.0,
                0.0
            ],
            "colour": "RED",
            "size": [
                3,
                3
            ],
            "startHeight": 6.0
        },
        {
            "type": "surface",
            "id": "bridgeAC_2_",
            "op_name": "log_asm.patch_dec",
            "location": [
                3.0,
                0.0
            ],
            "colour": "GREY",
            "size": [
                1,
                3
            ],
            "startHeight": 6.0
        },
        {
            "type": "surface",
            "id": "gen_id_2",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "NONE",
            "location": [
                0.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 6.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_2:patch_A_3_",
            "op_name": "log_asm.multi_pauli_meas",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": false,
                "-X": true,
                "+Y": true,
                "-Y": true
            },
            "fromSurfaceId": "gen_id_2",
            "toSurfaceId": "patch_A_3_"
        },
        {
            "type": "surface",
            "id": "patch_A_3_",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "NONE",
            "location": [
                0.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 9.0
        },
        {
            "type": "surface",
            "id": "gen_id_3",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "NONE",
            "location": [
                4.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 6.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_3:patch_C_3_",
            "op_name": "log_asm.multi_pauli_meas",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": true,
                "-X": false,
                "+Y": true,
                "-Y": true
            },
            "fromSurfaceId": "gen_id_3",
            "toSurfaceId": "patch_C_3_"
        },
        {
            "type": "surface",
            "id": "patch_C_3_",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "NONE",
            "location": [
                4.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 9.0
        },
        {
            "type": "surface",
            "id": "gen_id_4",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "RED",
            "location": [
                3.0,
                0.0
            ],
            "size": [
                1,
                3
            ],
            "startHeight": 6.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_4:gen_id_5",
            "op_name": "log_asm.multi_pauli_meas",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": false,
                "-X": false,
                "+Y": true,
                "-Y": true
            },
            "fromSurfaceId": "gen_id_4",
            "toSurfaceId": "gen_id_5"
        },
        {
            "type": "surface",
            "id": "gen_id_5",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "RED",
            "location": [
                3.0,
                0.0
            ],
            "size": [
                1,
                3
            ],
            "startHeight": 9.0
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_2:patch_A_3_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_4:gen_id_5",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_3:patch_C_3_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "surface",
            "id": "gen_id_6",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                0.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 9.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_6:patch_A_4_",
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
            "fromSurfaceId": "gen_id_6",
            "toSurfaceId": "patch_A_4_"
        },
        {
            "type": "surface",
            "id": "patch_A_4_",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                0.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 12.0
        },
        {
            "type": "surface",
            "id": "gen_id_7",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                4.0,
                4.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 12.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_7:patch_B_4_",
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
            "fromSurfaceId": "gen_id_7",
            "toSurfaceId": "patch_B_4_"
        },
        {
            "type": "surface",
            "id": "patch_B_4_",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                4.0,
                4.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 15.0
        },
        {
            "type": "surface",
            "id": "gen_id_8",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                4.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 15.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_8:patch_C_4_",
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
            "fromSurfaceId": "gen_id_8",
            "toSurfaceId": "patch_C_4_"
        },
        {
            "type": "surface",
            "id": "patch_C_4_",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                4.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 18.0
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_8:patch_C_4_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_7:patch_B_4_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "surface",
            "id": "bridgeBC_4_",
            "op_name": "log_asm.patch_dec",
            "location": [
                4.0,
                3.0
            ],
            "colour": "GREY",
            "size": [
                3,
                1
            ],
            "startHeight": 18.0
        },
        {
            "type": "surface",
            "id": "gen_id_9",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "NONE",
            "location": [
                4.0,
                4.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 18.0
        },
        {
            "type": "side",
            "id": "side_8:gen_id_9:patch_B_5_",
            "op_name": "log_asm.multi_pauli_meas",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": true,
                "-X": true,
                "+Y": true,
                "-Y": false
            },
            "fromSurfaceId": "gen_id_9",
            "toSurfaceId": "patch_B_5_"
        },
        {
            "type": "surface",
            "id": "patch_B_5_",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "NONE",
            "location": [
                4.0,
                4.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 21.0
        },
        {
            "type": "surface",
            "id": "gen_id_10",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "NONE",
            "location": [
                4.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 18.0
        },
        {
            "type": "side",
            "id": "side_9:gen_id_10:patch_C_5_",
            "op_name": "log_asm.multi_pauli_meas",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": true,
                "-X": true,
                "+Y": false,
                "-Y": true
            },
            "fromSurfaceId": "gen_id_10",
            "toSurfaceId": "patch_C_5_"
        },
        {
            "type": "surface",
            "id": "patch_C_5_",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "NONE",
            "location": [
                4.0,
                0.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 21.0
        },
        {
            "type": "surface",
            "id": "gen_id_11",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "BLUE",
            "location": [
                4.0,
                3.0
            ],
            "size": [
                3,
                1
            ],
            "startHeight": 18.0
        },
        {
            "type": "side",
            "id": "side_9:gen_id_11:gen_id_12",
            "op_name": "log_asm.multi_pauli_meas",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": true,
                "-X": true,
                "+Y": false,
                "-Y": false
            },
            "fromSurfaceId": "gen_id_11",
            "toSurfaceId": "gen_id_12"
        },
        {
            "type": "surface",
            "id": "gen_id_12",
            "op_name": "log_asm.multi_pauli_meas",
            "colour": "BLUE",
            "location": [
                4.0,
                3.0
            ],
            "size": [
                3,
                1
            ],
            "startHeight": 21.0
        },
        {
            "type": "correlation",
            "blockId": "side_9:gen_id_10:patch_C_5_",
            "surfaces": [
                "X+Y",
                "X-Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "correlation",
            "blockId": "side_9:gen_id_11:gen_id_12",
            "surfaces": [
                "X+Y",
                "X-Y"
            ],
            "colour": "BLUE"
        },
        {
            "type": "correlation",
            "blockId": "side_8:gen_id_9:patch_B_5_",
            "surfaces": [
                "X-Y",
                "X+Z",
                "X-Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "surface",
            "id": "measurementC",
            "op_name": "log_asm.measure",
            "location": [
                4.0,
                0.0
            ],
            "colour": "BLUE",
            "size": [
                3,
                3
            ],
            "startHeight": 21.0
        },
        {
            "type": "surface",
            "id": "gen_id_13",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                4.0,
                4.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 21.0
        },
        {
            "type": "side",
            "id": "side_9:gen_id_13:patch_B_6_",
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
            "fromSurfaceId": "gen_id_13",
            "toSurfaceId": "patch_B_6_"
        },
        {
            "type": "surface",
            "id": "patch_B_6_",
            "op_name": "log_asm.meas_stab",
            "colour": "NONE",
            "location": [
                4.0,
                4.0
            ],
            "size": [
                3,
                3
            ],
            "startHeight": 24.0
        },
        {
            "type": "correlation",
            "blockId": "side_9:gen_id_13:patch_B_6_",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "surface",
            "id": "measurementA",
            "op_name": "log_asm.measure",
            "location": [
                0.0,
                0.0
            ],
            "colour": "BLUE",
            "size": [
                3,
                3
            ],
            "startHeight": 24.0
        },
        {
            "type": "surface",
            "id": "measurementB",
            "op_name": "log_asm.measure",
            "location": [
                4.0,
                4.0
            ],
            "colour": "BLUE",
            "size": [
                3,
                3
            ],
            "startHeight": 24.0
        },
        {
            "type": "side",
            "id": "side_10:patch_A_2_:gen_id_2",
            "op_name": "correlation_gap",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": false,
                "-X": false,
                "+Y": false,
                "-Y": false
            },
            "fromSurfaceId": "patch_A_2_",
            "toSurfaceId": "gen_id_2"
        },
        {
            "type": "correlation",
            "blockId": "side_10:patch_A_2_:gen_id_2",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "side",
            "id": "side_10:patch_B_1_:gen_id_1",
            "op_name": "correlation_gap",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": false,
                "-X": false,
                "+Y": false,
                "-Y": false
            },
            "fromSurfaceId": "patch_B_1_",
            "toSurfaceId": "gen_id_1"
        },
        {
            "type": "correlation",
            "blockId": "side_10:patch_B_1_:gen_id_1",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "side",
            "id": "side_10:patch_B_2_:gen_id_7",
            "op_name": "correlation_gap",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": false,
                "-X": false,
                "+Y": false,
                "-Y": false
            },
            "fromSurfaceId": "patch_B_2_",
            "toSurfaceId": "gen_id_7"
        },
        {
            "type": "correlation",
            "blockId": "side_10:patch_B_2_:gen_id_7",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "side",
            "id": "side_10:patch_B_4_:gen_id_9",
            "op_name": "correlation_gap",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": false,
                "-X": false,
                "+Y": false,
                "-Y": false
            },
            "fromSurfaceId": "patch_B_4_",
            "toSurfaceId": "gen_id_9"
        },
        {
            "type": "correlation",
            "blockId": "side_10:patch_B_4_:gen_id_9",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        },
        {
            "type": "side",
            "id": "side_10:patch_C_3_:gen_id_8",
            "op_name": "correlation_gap",
            "colourScheme": [
                "BLUE",
                "RED"
            ],
            "sides": {
                "+X": false,
                "-X": false,
                "+Y": false,
                "-Y": false
            },
            "fromSurfaceId": "patch_C_3_",
            "toSurfaceId": "gen_id_8"
        },
        {
            "type": "correlation",
            "blockId": "side_10:patch_C_3_:gen_id_8",
            "surfaces": [
                "X-Z",
                "X+Z"
            ],
            "colour": "BLUE"
        }
    ]
};

const deltakit = new Deltakit('app');
deltakit.render(data);
