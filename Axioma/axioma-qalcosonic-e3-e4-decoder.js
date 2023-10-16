/********************************************************
*
*  Decoder for Axioma Qalcosonic E3/E4 LoRaWAN device.
*                                                     
*  For use with TTN or ChirpStack network deployments 
*                                                     
*  Written by Adam Hunter @ Utopi Ltd 
*
********************************************************/

function decodeUplink(input) {
    const result = {
        data: {},
        errors: [],
        warnings: [],
    };

    // Checking if valid data has been entered. If not, returning an error message.
    if (input.fPort === null) {
        return {
            errors: ['Unknown or null fPort value'],
        };
    }
    if (input.fPort === 101) {
        return {
            errors: ['Configuration message type.'],
        };
    }
    if (input.fPort !== 100) {
        return {
            errors: ['Invalid uplink message.'],
        };
    }

    if (input.bytes === null) {
        return {
            errors: ['Empty hex bytes field'],
        };
    }

    function mapErrorCode(errorCode) {
        // Define the mapping of error codes in hexadecimal format
        const errorCodes = {
            '04': 'Power low',
            '08': 'Permanent error',
            '10': 'Empty spool + temporary error',
            '14': 'Power low + temporary error + empty spool',
            '18': 'Empty spool + temporary error + permanent error',
            '1c': 'Power low + permanent error + empty spool + temporary error',
            '00': 'No error',
        };

        // Check if the error code exists in the mapping, otherwise return "Unknown"
        return errorCodes[errorCode] || 'Unknown';
    }

    function convertHexSliceToLittleEndian(hexString, start, end) {
        const hexSlice = hexString.substring(start, end);
        return convertToLittleEndian(hexSlice);
    }

    function convertToLittleEndian(hexString) {
        if (!/^[0-9A-Fa-f]+$/.test(hexString)) {
            throw new Error('Invalid hex string input');
        }
        return hexString.match(/.{2}/g).reverse().join('');
    }

    function convertHexToDecimal(hexString, multiplier = 1) {
        const decimalValue = parseInt(hexString, 16) * multiplier;
        return multiplier === 1 ? decimalValue : +decimalValue.toFixed(3);
    }

    function createError(message) {
        return {
            errors: [message],
        };
    }

    // Assign payload type byte lengths to named constants
    const basiclt = 35;
    const basicwithcool = 45;
    const basicwithheat = 41;
    const nordic = 48;
    const nordicwithcool = 30;

    // Decode function for BasicLT payload type
    function processBasicLTPayload(hexString) {
        const LEHexTimestamp = convertHexSliceToLittleEndian(hexString, 0, 8);
        const errorCode = hexString.substring(8, 10);
        const LEHexEnergyHPP = convertHexSliceToLittleEndian(hexString, 10, 18);
        const LEHexEnergyCPP = convertHexSliceToLittleEndian(hexString, 18, 26);
        const LEHexVolumePP = convertHexSliceToLittleEndian(hexString, 26, 34);
        const LEHexPowerPP = convertHexSliceToLittleEndian(hexString, 34, 40);
        const LEHexFlowPP = convertHexSliceToLittleEndian(hexString, 40, 46);
        const LEHexTemp1PP = convertHexSliceToLittleEndian(hexString, 46, 50);
        const LEHexTemp2PP = convertHexSliceToLittleEndian(hexString, 50, 54);
        const LEHexWorkTime = convertHexSliceToLittleEndian(hexString, 54, 62);
        const LEHexStorePeriod = convertHexSliceToLittleEndian(hexString, 62, 70);

        // Conversions for each value to end output formatting
        const unixTimestamp = convertHexToDecimal(LEHexTimestamp);
        const errorDescription = mapErrorCode(errorCode);
        const energyHPP = convertHexToDecimal(LEHexEnergyHPP);
        const energyCPP = convertHexToDecimal(LEHexEnergyCPP);
        const volumePP = convertHexToDecimal(LEHexVolumePP);
        const powerPP = LEHexPowerPP * 0.1;
        const flowPP = LEHexFlowPP * 0.001;
        const temp1PP = convertHexToDecimal(LEHexTemp1PP, 0.01);
        const temp2PP = convertHexToDecimal(LEHexTemp2PP, 0.01);
        const workTime = convertHexToDecimal(LEHexWorkTime);
        const storePeriod = convertHexToDecimal(LEHexStorePeriod);

        // Return output for above calculations
        return {
            data: {
                payloadtype: "BasicLT",
                timestamp: unixTimestamp,
                errorcodes: {
                    code: errorCode,
                    description: errorDescription,
                },
                energyheatpp: energyHPP,
                energycoolpp: energyCPP,
                volumepp: volumePP,
                powerpp: +powerPP.toFixed(1),
                flowpp: +flowPP.toFixed(3),
                temp1pp: temp1PP,
                temp2pp: temp2PP,
                workingtime: workTime,
                storeperiod: storePeriod,
            },
        };
    }

    // Decode function for Basic with heating energy payload type  
    function processBasicHeatPayload(hexString) {
        const LEHexTimestamp = convertHexSliceToLittleEndian(hexString, 0, 8);
        const errorCode = hexString.substring(8, 10);
        const LEHexEnergyH = convertHexSliceToLittleEndian(hexString, 10, 18);
        const LEHexVolume = convertHexSliceToLittleEndian(hexString, 18, 26);
        const LEHexEnergyHPP1 = convertHexSliceToLittleEndian(hexString, 26, 34);
        const LEHexVolumePP1 = convertHexSliceToLittleEndian(hexString, 34, 42);
        const LEHexEnergyHPP2 = convertHexSliceToLittleEndian(hexString, 42, 50);
        const LEHexVolumePP2 = convertHexSliceToLittleEndian(hexString, 50, 58);
        const LEHexEnergyHPP3 = convertHexSliceToLittleEndian(hexString, 58, 66);
        const LEHexVolumePP3 = convertHexSliceToLittleEndian(hexString, 66, 74);
        const LEHexStorePeriod = convertHexSliceToLittleEndian(hexString, 74, 82);

        // Conversions for each value to end output formatting
        const unixTimestamp = convertHexToDecimal(LEHexTimestamp);
        const errorDescription = mapErrorCode(errorCode);
        const energyH = convertHexToDecimal(LEHexEnergyH);
        const volume = convertHexToDecimal(LEHexVolume);
        const energyHPP1 = convertHexToDecimal(LEHexEnergyHPP1);
        const volumePP1 = convertHexToDecimal(LEHexVolumePP1);
        const energyHPP2 = convertHexToDecimal(LEHexEnergyHPP2);
        const volumePP2 = convertHexToDecimal(LEHexVolumePP2);
        const energyHPP3 = convertHexToDecimal(LEHexEnergyHPP3);
        const volumePP3 = convertHexToDecimal(LEHexVolumePP3);
        const storePeriod = convertHexToDecimal(LEHexStorePeriod);

        // Return output for above calculations
        return {
            data: {
                payloadtype: "Basic with heating energy",
                timestamp: unixTimestamp,
                errorcodes: {
                    code: errorCode,
                    description: errorDescription,
                },
                energyheat: energyH,
                volume: volume,
                energyheatpp1: energyHPP1,
                volumepp1: volumePP1,
                energyheatpp2: energyHPP2,
                volumepp2: volumePP2,
                energyheatpp3: energyHPP3,
                volumepp3: volumePP3,
                storeperiod: storePeriod,
            },
        };
    }

    // Decode function for Basic with cooling energy payload type   
    function processBasicCoolPayload(hexString) {
        const LEHexTimestamp = convertHexSliceToLittleEndian(hexString, 0, 8);
        const errorCode = hexString.substring(8, 10);
        const LEHexEnergyH = convertHexSliceToLittleEndian(hexString, 10, 18);
        const LEHexEnergyC = convertHexSliceToLittleEndian(hexString, 18, 26);
        const LEHexVolume = convertHexSliceToLittleEndian(hexString, 26, 34);
        const LEHexEnergyHPP1 = convertHexSliceToLittleEndian(hexString, 34, 42);
        const LEHexEnergyCPP1 = convertHexSliceToLittleEndian(hexString, 42, 50);
        const LEHexVolumePP1 = convertHexSliceToLittleEndian(hexString, 50, 58);
        const LEHexEnergyHPP2 = convertHexSliceToLittleEndian(hexString, 58, 66);
        const LEHexEnergyCPP2 = convertHexSliceToLittleEndian(hexString, 66, 74);
        const LEHexVolumePP2 = convertHexSliceToLittleEndian(hexString, 74, 82);
        const LEHexStorePeriod = convertHexSliceToLittleEndian(hexString, 82, 90);

        // Conversions for each value to end output formatting
        const unixTimestamp = convertHexToDecimal(LEHexTimestamp);
        const errorDescription = mapErrorCode(errorCode);
        const energyH = convertHexToDecimal(LEHexEnergyH);
        const energyC = convertHexToDecimal(LEHexEnergyC);
        const volume = convertHexToDecimal(LEHexVolume);
        const energyHPP1 = convertHexToDecimal(LEHexEnergyHPP1);
        const energyCPP1 = convertHexToDecimal(LEHexEnergyCPP1);
        const volumePP1 = convertHexToDecimal(LEHexVolumePP1);
        const energyHPP2 = convertHexToDecimal(LEHexEnergyHPP2);
        const energyCPP2 = convertHexToDecimal(LEHexEnergyCPP2);
        const volumePP2 = convertHexToDecimal(LEHexVolumePP2);
        const storePeriod = convertHexToDecimal(LEHexStorePeriod);

        // Return output for above calculations
        return {
            data: {
                payloadtype: "Basic with cooling energy",
                timestamp: unixTimestamp,
                errorcodes: {
                    code: errorCode,
                    description: errorDescription,
                },
                energyheat: energyH,
                energycool: energyC,
                volume: volume,
                energyheatpp1: energyHPP1,
                energycoolpp1: energyCPP1,
                volumepp1: volumePP1,
                energyheatpp2: energyHPP2,
                energycoolpp2: energyCPP2,
                volumepp2: volumePP2,
                storeperiod: storePeriod,
            },
        };
    }

    // Decode function for Nordic payload type
    function processNordicPayload(hexString) {
        const LEHexTimestamp = convertHexSliceToLittleEndian(hexString, 0, 8);
        const LEHexTimestampPP1 = convertHexSliceToLittleEndian(hexString, 8, 16);
        const LEHexEnergyPP1 = convertHexSliceToLittleEndian(hexString, 16, 24);
        const LEHexVolumePP1 = convertHexSliceToLittleEndian(hexString, 24, 32);
        const LEHexPowerPP1 = convertHexSliceToLittleEndian(hexString, 32, 38);
        const LEHexFlowPP1 = convertHexSliceToLittleEndian(hexString, 38, 44);
        const LEHexTemp1PP1 = convertHexSliceToLittleEndian(hexString, 44, 48);
        const LEHexTemp2PP1 = convertHexSliceToLittleEndian(hexString, 48, 52);
        const LEHexTimestampPP2 = convertHexSliceToLittleEndian(hexString, 52, 60);
        const LEHexEnergyPP2 = convertHexSliceToLittleEndian(hexString, 60, 68);
        const LEHexVolumePP2 = convertHexSliceToLittleEndian(hexString, 68, 76);
        const LEHexPowerPP2 = convertHexSliceToLittleEndian(hexString, 76, 82);
        const LEHexFlowPP2 = convertHexSliceToLittleEndian(hexString, 82, 88);
        const LEHexTemp1PP2 = convertHexSliceToLittleEndian(hexString, 88, 92);
        const LEHexTemp2PP2 = convertHexSliceToLittleEndian(hexString, 92, 96);


        // Conversions for each value to end output formatting
        const unixTimestamp = convertHexToDecimal(LEHexTimestamp);
        const unixTimestampPP1 = convertHexToDecimal(LEHexTimestampPP1);
        const energyPP1 = convertHexToDecimal(LEHexEnergyPP1);
        const volumePP1 = convertHexToDecimal(LEHexVolumePP1);
        const powerPP1 = LEHexPowerPP1 * 0.1;
        const flowPP1 = LEHexFlowPP1 * 0.001;
        const temp1PP1 = convertHexToDecimal(LEHexTemp1PP1, 0.01);
        const temp2PP1 = convertHexToDecimal(LEHexTemp2PP1, 0.01);
        const unixTimestampPP2 = convertHexToDecimal(LEHexTimestampPP2);
        const energyPP2 = convertHexToDecimal(LEHexEnergyPP2);
        const volumePP2 = convertHexToDecimal(LEHexVolumePP2);
        const powerPP2 = LEHexPowerPP2 * 0.1;
        const flowPP2 = LEHexFlowPP2 * 0.001;
        const temp1PP2 = convertHexToDecimal(LEHexTemp1PP2, 0.01);
        const temp2PP2 = convertHexToDecimal(LEHexTemp2PP2, 0.01);

        // Return output for above calculations
        return {
            data: {
                payloadtype: "Nordic",
                timestamp: unixTimestamp,
                timestamppp1: unixTimestampPP1,
                energypp1: energyPP1,
                volumepp1: volumePP1,
                powerpp1: +powerPP1.toFixed(1),
                flowpp1: +flowPP1.toFixed(3),
                temp1pp1: temp1PP1,
                temp2pp1: temp2PP1,
                timestamppp2: unixTimestampPP2,
                energypp2: energyPP2,
                volumepp2: volumePP2,
                powerpp2: +powerPP2.toFixed(1),
                flowpp2: +flowPP2.toFixed(3),
                temp1pp2: temp1PP2,
                temp2pp2: temp2PP2,
            },
        };
    }

    // Decode function for Nordic with cooling energy payload type
    function processNordicCoolPayload(hexString) {
        const LEHexTimestamp = convertHexSliceToLittleEndian(hexString, 0, 8);
        const LEHexTimestampPP1 = convertHexSliceToLittleEndian(hexString, 8, 16);
        const LEHexEnergyHPP1 = convertHexSliceToLittleEndian(hexString, 16, 24);
        const LEHexEnergyCPP1 = convertHexSliceToLittleEndian(hexString, 24, 32);
        const LEHexVolumePP1 = convertHexSliceToLittleEndian(hexString, 32, 40);
        const LEHexPowerPP1 = convertHexSliceToLittleEndian(hexString, 40, 46);
        const LEHexFlowPP1 = convertHexSliceToLittleEndian(hexString, 46, 52);
        const LEHexTemp1PP1 = convertHexSliceToLittleEndian(hexString, 52, 56);
        const LEHexTemp2PP1 = convertHexSliceToLittleEndian(hexString, 56, 60);

        // Conversions for each value to end output formatting
        const unixTimestamp = convertHexToDecimal(LEHexTimestamp);
        const unixTimestampPP1 = convertHexToDecimal(LEHexTimestampPP1);
        const energyHPP1 = convertHexToDecimal(LEHexEnergyHPP1);
        const energyCPP1 = convertHexToDecimal(LEHexEnergyCPP1);
        const volumePP1 = convertHexToDecimal(LEHexVolumePP1);
        const powerPP1 = LEHexPowerPP1 * 0.1;
        const flowPP1 = LEHexFlowPP1 * 0.001;
        const temp1PP1 = convertHexToDecimal(LEHexTemp1PP1, 0.01);
        const temp2PP1 = convertHexToDecimal(LEHexTemp2PP1, 0.01);

        // Return output for above calculations
        return {
            data: {
                payloadtype: "Nordic with cooling",
                timestamp: unixTimestamp,
                timestamppp1: unixTimestampPP1,
                energyhpp1: energyHPP1,
                energycpp1: energyCPP1,
                volumepp1: volumePP1,
                powerpp1: +powerPP1.toFixed(1),
                flowpp1: +flowPP1.toFixed(3),
                temp1pp1: temp1PP1,
                temp2pp1: temp2PP1,
            },
        };
    }

    // Convert the input object to a hex string
    const hexString = input.bytes.reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');

    // Switch and case to select payload decoder function dependent on HEX payload size in bytes
    switch (input.bytes.length) {
        case basiclt:
            return processBasicLTPayload(hexString);

        case basicwithcool:
            return processBasicCoolPayload(hexString);

        case basicwithheat:
            return processBasicHeatPayload(hexString);

        case nordic:
            return processNordicPayload(hexString);

        case nordicwithcool:
            return processNordicCoolPayload(hexString);

        default:
            return createError(`Unknown payload length/type: ${input.bytes.length} bytes`);
    };
}


function hexToDecimal(input) {
    if (!/^[0-9A-Fa-f]+$/.test(input)) {
        throw new Error('Invalid hex string input');
    }
    // Convert the hex input to decimal
    return parseInt(input, 16);
}
