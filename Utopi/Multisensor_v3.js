function decodeUplink(input) {
    // Checking if data has been entered. If not returning an error message and code.
      if (input.fPort === null) {
          return {
              errors: ['Unknown or null fPort value'],
          };
      }
        if (input.bytes === null) {
          return {
              errors: ['Unknown bytes value'],
          };
      }
    function bytesToHexArray(bytes) {
      return bytes.map(function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2);
      });
    }
    switch (input.fPort) {
      case 3:
        return {
          // Decoded data for fPort 3
          data: {
              temperature: Number(((input.bytes[0] << 8) | input.bytes[1]) / 100),
              pressure: Number(((input.bytes[2] << 8) | input.bytes[3]) / 10),
              humidity: Number(((input.bytes[4] << 8) | input.bytes[5]) / 100),
              pirCount: Number(((input.bytes[6] << 8) | input.bytes[7])),
              noise: Number(((input.bytes[8] << 8) | input.bytes[9]) / 100),
              light: Number(((input.bytes[10] << 8) | input.bytes[11])),
              iaq: Number(((input.bytes[12] << 8) | input.bytes[13])),
              iaqAccuracy: Number(input.bytes[14]),
              staticIaq: Number(((input.bytes[15] << 8) | input.bytes[16])),
              staticIaqAccuracy: Number(input.bytes[17]),
              co2: Number(((input.bytes[18] << 8) | input.bytes[19])),
              co2Accuracy: Number(input.bytes[20]),
              voc: Number(((input.bytes[21] << 8) | input.bytes[22])),
              vocAccuracy: Number(input.bytes[23]),
              batteryVolt: Number(((input.bytes[24] << 8) | input.bytes[25]) / 1000)
          },
        };
      case 5:
        return {
          // Decoded data for fPort 5
          data: {
              temperature: Number(((input.bytes[0] << 8) | input.bytes[1]) / 100),
              pressure: Number(((input.bytes[2] << 8) | input.bytes[3]) / 10),
              humidity: Number(((input.bytes[4] << 8) | input.bytes[5]) / 100),
              pirCount: Number(((input.bytes[6] << 8) | input.bytes[7])),
              noise: Number(((input.bytes[8] << 8) | input.bytes[9]) / 100),
              light: Number(((input.bytes[10] << 8) | input.bytes[11])),
              co2: Number(((input.bytes[12] << 8) | input.bytes[13])),
              voc: Number(((input.bytes[14] << 8) | input.bytes[15])),
              batteryVolt: Number(((input.bytes[16] << 8) | input.bytes[17]) / 1000)
          },
        };
      case 4:
        if (input.bytes[13] === 0) {var source = 'Battery powered'}
        else if (input.bytes[13] === 1) {source = 'USB powered'}
        else {source = 'Undefined'}
        var version = bytesToHexArray(input.bytes).slice(9,13).join('');

        return {

          data: {
              nonActiveStatus: Number(((input.bytes[0]<<8) | input.bytes[1])),
              activeStatus: Number(((input.bytes[2] << 8) | input.bytes[3])),
              activeReports: Number(input.bytes[4]),
              pirSlice: Number(input.bytes[5]),
              pirDuration: Number(((input.bytes[6] << 8) | input.bytes[7])),
              pirThreshold: Number(input.bytes[8]),
              swVersion: version,
              powerSource: source

          },
        };
      case 6:
        return {
          data: {data:'Hall triggered'}
        };
          default:
              return {
                  errors: ['Unknown fPort value'],
              };
    }
  }
