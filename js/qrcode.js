// @ts-nocheck
//---------------------------------------------------------------------
//
//  QRCode for JavaScript
//
//  Copyright (c) 2009 Kazuhiko Arase
//
//  URL: http://www.d-project.com/
//
//  Licensed under the MIT license:
//    http://www.opensource.org/licenses/mit-license.php
//
//  The word "QR Code" is registered trademark of
//  DENSO WAVE INCORPORATED
//
//---------------------------------------------------------------------

//---------------------------------------------------------------------
// QRCode
//---------------------------------------------------------------------

var QRCode = function() {};

var qrcode = function(typeNumber, errorCorrectionLevel) {

	var PAD0 = 0x00;
	var PAD1 = 0x01;

	var QR_PAD0 = 0xEC;
	var QR_PAD1 = 0x11;

	var _getData = function(data, mode) {
		var bitBuffer = new BitBuffer();
		var i;
		var j;
		var k;

		// If data is URL, convert to ASCII/UTF-8 and choose optimal mode
		if (mode == QRCode.Mode.ALPHANUM) {
			for (i = 0; i < data.length; i++) {
				bitBuffer.put(data.charCodeAt(i), 8);
			}
		} else if (mode == QRCode.Mode.NUMBER) {
			for (i = 0; i < data.length; i++) {
				bitBuffer.put(parseInt(data.charAt(i)), 4);
			}
		} else if (mode == QRCode.Mode["8BIT_BYTE"]) {
			for (i = 0; i < data.length; i++) {
				bitBuffer.put(data.charCodeAt(i), 8);
			}
		} else if (mode == QRCode.Mode.KANJI) {
			// Kanji mode is not supported in this implementation.
			throw 'KANJI mode is not supported in this QR code generator.';
		} else {
			throw 'Invalid mode: ' + mode;
		}

		return new BitBuffer(bitBuffer.getArray(), bitBuffer.getLength());
	};

	var _getBitBuffer = function(typeNumber, errorCorrectionLevel, dataList) {
		var buffer = new BitBuffer();
		var i;
		var data;

		// Add mode indicator for each data
		for (i = 0; i < dataList.length; i++) {
			data = dataList[i];
			buffer.put(data.mode, 4); // 4-bit mode indicator
			buffer.put(data.length, QRCode.getLengthInBits(data.mode, typeNumber));
			buffer.putData(data.bitBuffer);
		}

		// Add terminator
		var numDataBits = QRCode.getRSBlocksTotalDataCount(typeNumber, errorCorrectionLevel) * 8;
		if (buffer.getLength() < numDataBits) {
			buffer.put(0, Math.min(4, numDataBits - buffer.getLength()));
		}
		if (buffer.getLength() % 8 != 0) {
			buffer.put(0, 8 - (buffer.getLength() % 8));
		}
		while (buffer.getLength() < numDataBits) {
			buffer.put(QR_PAD0, 8);
			if (buffer.getLength() < numDataBits) {
				buffer.put(QR_PAD1, 8);
			}
		}

		return buffer;
	};

	var _getModuleCount = function(typeNumber) {
		return typeNumber * 4 + 17;
	};

	var _getMatrix = function(typeNumber, errorCorrectionLevel) {
		var matrix = [];
		var moduleCount = _getModuleCount(typeNumber);
		var row;
		var col;

		for (row = 0; row < moduleCount; row++) {
			matrix[row] = [];
			for (col = 0; col < moduleCount; col++) {
				matrix[row][col] = null;
			}
		}

		// Fill finder patterns
		_setFinderPattern(matrix, 0, 0);
		_setFinderPattern(matrix, moduleCount - 7, 0);
		_setFinderPattern(matrix, 0, moduleCount - 7);

		// Fill alignment patterns
		_setAlignmentPattern(matrix, typeNumber);

		// Fill timing patterns
		_setTimingPattern(matrix);

		// Fill format information
		_setFormatInfo(matrix, errorCorrectionLevel);

		// Fill version information
		_setVersionInfo(matrix, typeNumber);

		// Fill function patterns
		_setFunctionPatterns(matrix);

		return matrix;
	};

	var _setFinderPattern = function(matrix, row, col) {
		var x;
		var y;

		for (y = -1; y <= 7; y++) {
			for (x = -1; x <= 7; x++) {
				if (row + y < 0 || _getModuleCount(typeNumber) <= row + y ||
					col + x < 0 || _getModuleCount(typeNumber) <= col + x) {
					continue;
				}
				if ((y >= 0 && y <= 6 && (x == 0 || x == 6)) ||
					(x >= 0 && x <= 6 && (y == 0 || y == 6)) ||
					(y >= 2 && y <= 4 && x >= 2 && x <= 4)) {
					matrix[row + y][col + x] = true;
				} else {
					matrix[row + y][col + x] = false;
				}
			}
		}
	};

	var _setAlignmentPattern = function(matrix, typeNumber) {
		var pos = QRCode.getAlignmentPatternPositions(typeNumber);
		var i;
		var j;
		var row;
		var col;
		var x;
		var y;

		for (i = 0; i < pos.length; i++) {
			for (j = 0; j < pos.length; j++) {
				row = pos[i];
				col = pos[j];

				if (matrix[row][col] != null) {
					continue;
				}

				for (y = -2; y <= 2; y++) {
					for (x = -2; x <= 2; x++) {
						if ((y == -2 || y == 2 || x == -2 || x == 2) ||
							(y == 0 && x == 0)) {
							matrix[row + y][col + x] = true;
						} else {
							matrix[row + y][col + x] = false;
						}
					}
				}
			}
		}
	};

	var _setTimingPattern = function(matrix) {
		var moduleCount = _getModuleCount(typeNumber);
		var i;

		for (i = 8; i < moduleCount - 8; i++) {
			if (matrix[6][i] == null) {
				matrix[6][i] = (i % 2 == 0);
			}
			if (matrix[i][6] == null) {
				matrix[i][6] = (i % 2 == 0);
			}
		}
	};

	var _setFormatInfo = function(matrix, errorCorrectionLevel) {
		var moduleCount = _getModuleCount(typeNumber);
		var data = QRCode.getFormatInfo(errorCorrectionLevel);
		var i;

		for (i = 0; i < 8; i++) {
			matrix[8][i] = QRCode.getBit(data, 14 - i);
		}
		matrix[8][8] = true;
		for (i = 9; i < 15; i++) {
			matrix[8][i] = QRCode.getBit(data, 15 - i);
		}

		for (i = 0; i < 8; i++) {
			matrix[i][_getModuleCount(typeNumber) - 1 - i] = QRCode.getBit(data, i);
		}
		matrix[8][moduleCount - 8] = true;
		for (i = 0; i < 7; i++) {
			matrix[_getModuleCount(typeNumber) - 7 + i][8] = QRCode.getBit(data, 7 + i);
		}
	};

	var _setVersionInfo = function(matrix, typeNumber) {
		if (typeNumber < 7) {
			return;
		}

		var moduleCount = _getModuleCount(typeNumber);
		var data = QRCode.getVersionInfo(typeNumber);
		var i;
		var j;

		for (i = 0; i < 6; i++) {
			for (j = 0; j < 3; j++) {
				matrix[moduleCount - 11 + j][i] = QRCode.getBit(data, (i * 3) + j);
			}
		}

		for (i = 0; i < 3; i++) {
			for (j = 0; j < 6; j++) {
				matrix[i][moduleCount - 11 + j] = QRCode.getBit(data, (j * 3) + i);
			}
		}
	};

	var _setFunctionPatterns = function(matrix) {
		var moduleCount = _getModuleCount(typeNumber);
		var i;

		// Set the dark module
		matrix[moduleCount - 8][8] = true;

		// Fill the remainder (not used function patterns) with false
		for (i = 0; i < 8; i++) {
			if (i != 6 && matrix[8][i] == null) {
				matrix[8][i] = false;
			}
			if (i != 6 && matrix[i][8] == null) {
				matrix[i][8] = false;
			}
		}

		for (i = 9; i < 15; i++) {
			if (matrix[8][i] == null) {
				matrix[8][i] = false;
			}
		}

		for (i = 0; i < 8; i++) {
			if (matrix[i][moduleCount - 8] == null) {
				matrix[i][moduleCount - 8] = false;
			}
		}
	};

	var _mapDataIntoMatrix = function(matrix, data, maskPattern) {
		var moduleCount = _getModuleCount(typeNumber);
		var bitIndex = 0;
		var direction = 1;
		var row = moduleCount - 1;
		var col = moduleCount - 1;
		var i;

		while (col > 0) {
			if (col == 6) {
				col--; // Skip vertical timing pattern
			}

			while (row >= 0 && row < moduleCount) {
				for (i = 0; i < 2; i++) {
					var c = col - i;
					if (matrix[row][c] != null) {
						continue;
					}

					var bit = QRCode.getBit(data, bitIndex);
					bitIndex++;

					var masked = QRCode.getMaskedBit(bit, maskPattern, row, c);
					matrix[row][c] = masked;
				}
				row += direction;
			}

			direction = -direction;
			row += direction;
			col -= 2;
		}
	};

	var _getBestMaskPattern = function(matrix, data) {
		var minPenalty = Infinity;
		var bestMaskPattern = 0;
		var maskPattern;

		for (maskPattern = 0; maskPattern < 8; maskPattern++) {
			_mapDataIntoMatrix(matrix, data, maskPattern);
			var penalty = QRCode.getPenalty(matrix);
			if (penalty < minPenalty) {
				minPenalty = penalty;
				bestMaskPattern = maskPattern;
			}
		}

		return bestMaskPattern;
	};


	// Public API
	this.addData = function(data, mode) {
		if (mode == null) {
			mode = QRCode.Mode["8BIT_BYTE"]; // Default mode if not specified
		}
		var newData = new QRCode.Data(data.length, mode, _getData(data, mode));
		_dataList.push(newData);
		_dataCache = null; // Clear cache
	};

	this.make = function() {
		// If data is not set, initialize with empty string to avoid errors
		if (_dataList.length == 0) {
			this.addData('');
		}

		if (_dataCache == null) {
			_dataCache = _getBitBuffer(typeNumber, errorCorrectionLevel, _dataList);
		}

		_matrix = _getMatrix(typeNumber, errorCorrectionLevel);
		_mapDataIntoMatrix(_matrix, _dataCache, _getBestMaskPattern(_matrix, _dataCache));
	};

	this.is  = function(row, col) {
		return _matrix[row][col];
	};

	this.createTableTag = function(cellSize, margin) {
		if (cellSize == undefined || cellSize == null) {
			cellSize = 2; // Default cell size
		}
		if (margin == undefined || margin == null) {
			margin = 0; // Default margin
		}

		var moduleCount = _getModuleCount(typeNumber);
		var table = '<table>';
		var row;
		var col;

		// Add margin rows
		for (row = 0; row < moduleCount + margin * 2; row++) {
			table += '<tr>';
			// Add margin columns
			for (col = 0; col < moduleCount + margin * 2; col++) {
				table += '<td';
				if (row < margin || row >= moduleCount + margin ||
					col < margin || col >= moduleCount + margin ||
					this.is(row - margin, col - margin)) {
					table += ' class="qr-cell"'; // Add class for styling
				}
				table += '/>';
			}
			table += '</tr>';
		}
		table += '</table>';

		return table;
	};

	this.createImgTag = function(cellSize, margin) {
		if (cellSize == undefined || cellSize == null) {
			cellSize = 2;
		}
		if (margin == undefined || margin == null) {
			margin = 0;
		}

		var moduleCount = _getModuleCount(typeNumber);
		var size = moduleCount * cellSize + margin * 2;
		var image = new Image();
		image.src = this.createDataURL(cellSize, margin);
		image.width = size;
		image.height = size;

		return image;
	};

	this.createDataURL = function(cellSize, margin) {
		if (cellSize == undefined || cellSize == null) {
			cellSize = 2;
		}
		if (margin == undefined || margin == null) {
			margin = 0;
		}

		var moduleCount = _getModuleCount(typeNumber);
		var size = moduleCount * cellSize + margin * 2 * cellSize; // Correct calculation for margin
		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		var ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, size, size);
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, size, size);

		for (var row = 0; row < moduleCount; row++) {
			for (var col = 0; col < moduleCount; col++) {
				if (this.is(row, col)) {
					ctx.fillStyle = '#000000';
					ctx.fillRect((col + margin) * cellSize, (row + margin) * cellSize, cellSize, cellSize);
				}
			}
		}

		return canvas.toDataURL('image/png');
	};

	var _dataList = [];
	var _dataCache = null;
	var _matrix = null;

	if (typeNumber == undefined || typeNumber == null) {
		typeNumber = 1;
	}
	if (errorCorrectionLevel == undefined || errorCorrectionLevel == null) {
		errorCorrectionLevel = QRCode.ErrorCorrectionLevel.L;
	}

	this.typeNumber = typeNumber;
	this.errorCorrectionLevel = errorCorrectionLevel;
};


//---------------------------------------------------------------------
// QRCode
//---------------------------------------------------------------------

// Modes
QRCode.Mode = {
	NUMBER:		1 << 0,
	ALPHANUM:	1 << 1,
	"8BIT_BYTE":	1 << 2,
	KANJI:		1 << 3
};

// Error Correction Levels
QRCode.ErrorCorrectionLevel = {
	L : 1, // 7%
	M : 0, // 15%
	Q : 3, // 25%
	H : 2  // 30%
};

// Data Lengths
QRCode.getLengthInBits = function(mode, type) {
	if (type >= 1 && type < 10) {
		// 1 to 9
		switch(mode) {
			case QRCode.Mode.NUMBER	  : return 10;
			case QRCode.Mode.ALPHANUM : return 9;
			case QRCode.Mode["8BIT_BYTE"]: return 8;
			case QRCode.Mode.KANJI	  : return 8;
		}
	} else if (type < 27) {
		// 10 to 26
		switch(mode) {
			case QRCode.Mode.NUMBER	  : return 12;
			case QRCode.Mode.ALPHANUM : return 11;
			case QRCode.Mode["8BIT_BYTE"]: return 16;
			case QRCode.Mode.KANJI	  : return 10;
		}
	} else if (type < 41) {
		// 27 to 40
		switch(mode) {
			case QRCode.Mode.NUMBER	  : return 14;
			case QRCode.Mode.ALPHANUM : return 13;
			case QRCode.Mode["8BIT_BYTE"]: return 16;
			case QRCode.Mode.KANJI	  : return 12;
		}
	}
	throw 'Invalid type or mode: ' + type + ', ' + mode;
};

// Reed Solomon Blocks
QRCode.getRSBlocks = function(type, errorCorrectionLevel) {
	var rsBlocks = QRCode.RS_BLOCK_TABLE[ (type - 1) * 4 + errorCorrectionLevel ];
	if (rsBlocks == undefined) {
		throw 'Bad RS blocks for type: ' + type + ', level: ' + errorCorrectionLevel;
	}
	return new QRCode.RSBlocks(rsBlocks[0], rsBlocks[1]);
};

QRCode.getRSBlocksTotalDataCount = function(type, errorCorrectionLevel) {
	var rsBlocks = QRCode.getRSBlocks(type, errorCorrectionLevel);
	var totalDataCount = 0;
	for (var i = 0; i < rsBlocks.length; i++) {
		totalDataCount += rsBlocks[i].dataCount;
	}
	return totalDataCount;
};

// Alignment Pattern Positions
QRCode.getAlignmentPatternPositions = function(type) {
	return QRCode.ALIGNMENT_PATTERN_POSITION_TABLE[type - 1];
};

// Version Information (for types 7-40)
QRCode.getVersionInfo = function(type) {
	return QRCode.VERSION_INFO_TABLE[type - 7];
};

// Format Information (for all types)
QRCode.getFormatInfo = function(errorCorrectionLevel) {
	return QRCode.FORMAT_INFO_TABLE[errorCorrectionLevel];
};

// Mask Patterns
QRCode.getMaskedBit = function(bit, maskPattern, row, col) {
	switch(maskPattern) {
		case 0 : return (bit + (row + col) % 2 == 0);
		case 1 : return (bit + (row) % 2 == 0);
		case 2 : return (bit + (col) % 3 == 0);
		case 3 : return (bit + (row + col) % 3 == 0);
		case 4 : return (bit + (Math.floor(row / 2) + Math.floor(col / 3)) % 2 == 0);
		case 5 : return (bit + (row * col) % 2 + (row * col) % 3 == 0);
		case 6 : return (bit + ((row * col) % 2 + (row * col) % 3) % 2 == 0);
		case 7 : return (bit + ((row * col) % 3 + (row + col) % 2) % 2 == 0);
	}
	throw 'Invalid mask pattern: ' + maskPattern;
};

// Penalty calculations
QRCode.getPenalty = function(matrix) {
	var penalty = 0;
	var moduleCount = matrix.length;
	var row;
	var col;
	var count;
	var dark;
	var prev;

	// Rule 1: Consecutive modules of the same color
	for (row = 0; row < moduleCount; row++) {
		dark = 0;
		count = 0;
		prev = null;
		for (col = 0; col < moduleCount; col++) {
			if (matrix[row][col] == prev) {
				count++;
			} else {
				count = 1;
				prev = matrix[row][col];
			}
			if (count == 5) {
				penalty += 3;
			} else if (count > 5) {
				penalty += 1;
			}
		}
	}
	for (col = 0; col < moduleCount; col++) {
		dark = 0;
		count = 0;
		prev = null;
		for (row = 0; row < moduleCount; row++) {
			if (matrix[row][col] == prev) {
				count++;
			} else {
				count = 1;
				prev = matrix[row][col];
			}
			if (count == 5) {
				penalty += 3;
			} else if (count > 5) {
				penalty += 1;
			}
		}
	}

	// Rule 2: 2x2 blocks of same color
	for (row = 0; row < moduleCount - 1; row++) {
		for (col = 0; col < moduleCount - 1; col++) {
			if (matrix[row][col] == matrix[row + 1][col] &&
				matrix[row][col] == matrix[row][col + 1] &&
				matrix[row][col] == matrix[row + 1][col + 1]) {
				penalty += 3;
			}
		}
	}

	// Rule 3: Finder pattern-like regions
	for (row = 0; row < moduleCount; row++) {
		for (col = 0; col < moduleCount; col++) {
			if (col + 6 < moduleCount &&
				matrix[row][col] && !matrix[row][col + 1] && matrix[row][col + 2] &&
				matrix[row][col + 3] && matrix[row][col + 4] && !matrix[row][col + 5] &&
				matrix[row][col + 6]) {
				penalty += 40;
			}
			if (row + 6 < moduleCount &&
				matrix[row][col] && !matrix[row + 1][col] && matrix[row + 2][col] &&
				matrix[row + 3][col] && matrix[row + 4][col] && !matrix[row + 5][col] &&
				matrix[row + 6][col]) {
				penalty += 40;
			}
		}
	}

	// Rule 4: Ratio of dark to light modules
	dark = 0;
	for (row = 0; row < moduleCount; row++) {
		for (col = 0; col < moduleCount; col++) {
			if (matrix[row][col]) {
				dark++;
			}
		}
	}
	var total = moduleCount * moduleCount;
	var ratio = Math.abs( (dark * 100 / total) - 50) / 5;
	penalty += Math.floor(ratio) * 10;

	return penalty;
};

// Data Class
QRCode.Data = function(length, mode, bitBuffer) {
	this.length = length;
	this.mode = mode;
	this.bitBuffer = bitBuffer;
};

// RSBlocks Class
QRCode.RSBlocks = function(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount = dataCount;
};

// BitBuffer Class
function BitBuffer() {
	this.buffer = [];
	this.length = 0;
}

BitBuffer.prototype.getArray = function() {
	return this.buffer;
};

BitBuffer.prototype.getLength = function() {
	return this.length;
};

BitBuffer.prototype.put = function(num, length) {
	for (var i = 0; i < length; i++) {
		this.putBit( ((num >>> (length - 1 - i)) & 1) == 1 );
	}
};

BitBuffer.prototype.putBit = function(bit) {
	var bufIndex = Math.floor(this.length / 8);
	if (this.buffer.length <= bufIndex) {
		this.buffer.push(0);
	}
	if (bit) {
		this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
	}
	this.length++;
};

BitBuffer.prototype.putData = function(data) {
	var array = data.getArray();
	for (var i = 0; i < array.length; i++) {
		this.buffer.push(array[i]);
	}
	this.length += data.getLength();
};

QRCode.getBit = function(buffer, bitIndex) {
	var bufIndex = Math.floor(bitIndex / 8);
	return ( (buffer.getArray()[bufIndex] >>> (7 - (bitIndex % 8))) & 1) == 1;
};


// Reed Solomon Tables
QRCode.RS_BLOCK_TABLE = [
	// L
	[1, 26, 19],
	[1, 26, 16],
	[1, 26, 13],
	[1, 26, 9],

	// M
	[1, 44, 34],
	[1, 44, 28],
	[1, 44, 22],
	[1, 44, 16],

	// Q
	[1, 70, 55],
	[1, 70, 44],
	[2, 35, 17],
	[2, 35, 13],

	// H
	[1, 100, 80],
	[2, 50, 32],
	[2, 50, 24],
	[4, 25, 9]
];

QRCode.RS_BLOCK_TABLE = [
	// version 1
	// L
	[1, 26, 19],
	// M
	[1, 26, 16],
	// Q
	[1, 26, 13],
	// H
	[1, 26, 9],

	// version 2
	// L
	[1, 44, 34],
	// M
	[1, 44, 28],
	// Q
	[1, 44, 22],
	// H
	[1, 44, 16],

	// version 3
	// L
	[1, 70, 55],
	// M
	[1, 70, 44],
	// Q
	[2, 35, 17],
	// H
	[2, 35, 13],

	// version 4
	// L
	[1, 100, 80],
	// M
	[2, 50, 32],
	// Q
	[2, 50, 24],
	// H
	[4, 25, 9],

	// version 5
	// L
	[1, 134, 108],
	// M
	[2, 67, 43],
	// Q
	[2, 33, 15, 2, 34, 16],
	// H
	[2, 33, 11, 2, 34, 12],

	// version 6
	// L
	[2, 170, 136],
	// M
	[2, 85, 68],
	// Q
	[4, 43, 27, 2, 44, 28],
	// H
	[4, 43, 19, 2, 44, 20],

	// version 7
	// L
	[2, 208, 167],
	// M
	[4, 104, 84],
	// Q
	[4, 52, 32, 4, 53, 33],
	// H
	[8, 26, 13, 4, 27, 14],

	// version 8
	// L
	[2, 240, 193],
	// M
	[2, 120, 97, 4, 121, 98],
	// Q
	[4, 40, 26, 6, 41, 27],
	// H
	[8, 40, 17, 4, 41, 18],

	// version 9
	// L
	[2, 272, 221],
	// M
	[3, 136, 109, 5, 137, 110],
	// Q
	[4, 43, 27, 14, 44, 28],
	// H
	[16, 43, 17, 4, 44, 18],

	// version 10
	// L
	[2, 304, 243],
	// M
	[4, 152, 121, 14, 153, 122],
	// Q
	[6, 45, 28, 14, 46, 29],
	// H
	[6, 45, 19, 14, 46, 20],

	// version 11
	// L
	[2, 336, 273, 2, 337, 274],
	// M
	[4, 168, 135, 14, 169, 136],
	// Q
	[8, 47, 30, 14, 48, 31],
	// H
	[12, 47, 20, 16, 48, 21],

	// version 12
	// L
	[4, 368, 295, 4, 369, 296],
	// M
	[16, 174, 139],
	// Q
	[16, 48, 30, 14, 49, 31],
	// H
	[24, 48, 20, 12, 49, 21],

	// version 13
	// L
	[4, 400, 318, 6, 401, 319],
	// M
	[18, 183, 145, 2, 184, 146],
	// Q
	[30, 48, 28, 2, 49, 29],
	// H
	[18, 48, 20, 16, 49, 21],

	// version 14
	// L
	[4, 432, 344, 10, 433, 345],
	// M
	[10, 194, 155, 2, 195, 156],
	// Q
	[19, 50, 28, 6, 51, 29],
	// H
	[26, 50, 20, 10, 51, 21],

	// version 15
	// L
	[8, 464, 365, 4, 465, 366],
	// M
	[22, 195, 155, 2, 196, 156],
	// Q
	[33, 54, 30, 4, 55, 31],
	// H
	[12, 54, 20, 28, 55, 21],

	// version 16
	// L
	[8, 496, 395, 4, 497, 396],
	// M
	[18, 207, 167, 6, 208, 168],
	// Q
	[39, 56, 32, 4, 57, 33],
	// H
	[14, 56, 20, 34, 57, 21],

	// version 17
	// L
	[10, 530, 422, 2, 531, 423],
	// M
	[20, 216, 174, 6, 217, 175],
	// Q
	[48, 58, 34, 6, 59, 35],
	// H
	[28, 58, 20, 16, 59, 21],

	// version 18
	// L
	[12, 562, 446, 4, 563, 447],
	// M
	[24, 226, 182, 6, 227, 183],
	// Q
	[49, 60, 36, 10, 61, 37],
	// H
	[24, 60, 20, 46, 61, 21],

	// version 19
	// L
	[16, 594, 474, 4, 595, 475],
	// M
	[28, 236, 190, 6, 237, 191],
	// Q
	[49, 61, 36, 22, 62, 37],
	// H
	[28, 61, 20, 46, 62, 21],

	// version 20
	// L
	[18, 626, 502, 6, 627, 503],
	// M
	[30, 246, 198, 8, 247, 199],
	// Q
	[51, 62, 36, 28, 63, 37],
	// H
	[26, 62, 20, 48, 63, 21],

	// version 21
	// L
	[24, 660, 528, 4, 661, 529],
	// M
	[28, 256, 206, 8, 257, 207],
	// Q
	[55, 64, 38, 26, 65, 39],
	// H
	[30, 64, 20, 50, 65, 21],

	// version 22
	// L
	[25, 694, 551, 6, 695, 552],
	// M
	[30, 267, 215, 8, 268, 216],
	// Q
	[60, 66, 39, 30, 67, 40],
	// H
	[20, 66, 20, 62, 67, 21],

	// version 23
	// L
	[26, 726, 581, 6, 727, 582],
	// M
	[32, 278, 224, 8, 279, 225],
	// Q
	[67, 68, 41, 26, 69, 42],
	// H
	[34, 68, 20, 48, 69, 21],

	// version 24
	// L
	[28, 762, 606, 6, 763, 607],
	// M
	[35, 290, 235, 10, 291, 236],
	// Q
	[48, 69, 42, 28, 70, 43],
	// H
	[40, 70, 20, 40, 71, 21],

	// version 25
	// L
	[30, 800, 634, 8, 801, 635],
	// M
	[37, 301, 243, 12, 302, 244],
	// Q
	[51, 71, 43, 30, 72, 44],
	// H
	[42, 71, 20, 42, 72, 21],

	// version 26
	// L
	[32, 840, 666, 8, 841, 667],
	// M
	[40, 313, 251, 14, 314, 252],
	// Q
	[59, 73, 45, 28, 74, 46],
	// H
	[44, 73, 20, 46, 74, 21],

	// version 27
	// L
	[34, 884, 700, 10, 885, 701],
	// M
	[42, 325, 259, 16, 326, 260],
	// Q
	[74, 75, 47, 26, 76, 48],
	// H
	[48, 75, 20, 42, 76, 21],

	// version 28
	// L
	[36, 928, 736, 12, 929, 737],
	// M
	[44, 337, 269, 18, 338, 270],
	// Q
	[76, 77, 49, 30, 78, 50],
	// H
	[50, 77, 20, 46, 78, 21],

	// version 29
	// L
	[38, 972, 772, 14, 973, 773],
	// M
	[47, 349, 281, 20, 350, 282],
	// Q
	[78, 79, 51, 32, 80, 52],
	// H
	[54, 79, 20, 48, 80, 21],

	// version 30
	// L
	[40, 1016, 812, 16, 1017, 813],
	// M
	[49, 361, 291, 22, 362, 292],
	// Q
	[80, 81, 53, 34, 82, 54],
	// H
	[56, 81, 20, 50, 82, 21],

	// version 31
	// L
	[42, 1064, 852, 18, 1065, 853],
	// M
	[53, 373, 301, 24, 374, 302],
	// Q
	[84, 83, 55, 36, 84, 56],
	// H
	[58, 83, 20, 52, 84, 21],

	// version 32
	// L
	[44, 1112, 892, 20, 1113, 893],
	// M
	[56, 385, 311, 26, 386, 312],
	// Q
	[86, 85, 57, 38, 86, 58],
	// H
	[60, 85, 20, 54, 86, 21],

	// version 33
	// L
	[46, 1160, 932, 22, 1161, 933],
	// M
	[59, 397, 321, 28, 398, 322],
	// Q
	[90, 87, 59, 40, 88, 60],
	// H
	[62, 87, 20, 56, 88, 21],

	// version 34
	// L
	[48, 1208, 972, 24, 1209, 973],
	// M
	[62, 409, 331, 30, 410, 332],
	// Q
	[92, 89, 61, 42, 90, 62],
	// H
	[64, 89, 20, 58, 90, 21],

	// version 35
	// L
	[50, 1256, 1012, 26, 1257, 1013],
	// M
	[66, 421, 341, 32, 422, 342],
	// Q
	[95, 91, 63, 44, 92, 64],
	// H

	[66, 91, 20, 60, 92, 21],

	// version 36
	// L
	[52, 1304, 1052, 28, 1305, 1053],
	// M
	[70, 433, 351, 34, 434, 352],
	// Q
	[101, 93, 65, 46, 94, 66],
	// H
	[70, 93, 20, 62, 94, 21],

	// version 37
	// L
	[54, 1352, 1092, 30, 1353, 1093],
	// M
	[72, 445, 361, 36, 446, 362],
	// Q
	[108, 95, 67, 48, 96, 68],
	// H
	[72, 95, 20, 64, 96, 21],

	// version 38
	// L
	[56, 1400, 1132, 32, 1401, 1133],
	// M
	[76, 457, 371, 38, 458, 372],
	// Q
	[110, 97, 69, 50, 98, 70],
	// H
	[74, 97, 20, 66, 98, 21],

	// version 39
	// L
	[58, 1448, 1172, 34, 1449, 1173],
	// M
	[78, 469, 381, 40, 470, 382],
	// Q
	[117, 99, 71, 52, 100, 72],
	// H
	[76, 99, 20, 68, 100, 21],

	// version 40
	// L
	[60, 1496, 1212, 36, 1497, 1213],
	// M
	[81, 481, 391, 42, 482, 392],
	// Q
	[120, 101, 73, 54, 102, 74],
	// H
	[78, 101, 20, 70, 102, 21]
];

// Alignment Pattern Position Table
QRCode.ALIGNMENT_PATTERN_POSITION_TABLE = [
	[], // 1
	[6, 18], // 2
	[6, 22], // 3
	[6, 26], // 4
	[6, 30], // 5
	[6, 34], // 6
	[6, 22, 38], // 7
	[6, 24, 42], // 8
	[6, 26, 46], // 9
	[6, 28, 50], // 10
	[6, 30, 54], // 11
	[6, 32, 58], // 12
	[6, 34, 62], // 13
	[6, 26, 46, 66], // 14
	[6, 26, 48, 70], // 15
	[6, 26, 50, 74], // 16
	[6, 30, 54, 78], // 17
	[6, 30, 56, 82], // 18
	[6, 30, 58, 86], // 19
	[6, 34, 62, 90], // 20
	[6, 28, 50, 72, 94], // 21
	[6, 26, 50, 74, 98], // 22
	[6, 30, 54, 78, 102], // 23
	[6, 28, 54, 80, 106], // 24
	[6, 32, 58, 84, 110], // 25
	[6, 30, 58, 86, 114], // 26
	[6, 34, 62, 90, 118], // 27
	[6, 26, 50, 74, 98, 122], // 28
	[6, 30, 54, 78, 102, 126], // 29
	[6, 26, 52, 78, 104, 130], // 30
	[6, 30, 56, 82, 108, 134], // 31
	[6, 34, 60, 86, 112, 138], // 32
	[6, 30, 58, 86, 114, 142], // 33
	[6, 34, 62, 90, 118, 146], // 34
	[6, 30, 54, 78, 102, 126, 150], // 35
	[6, 24, 50, 76, 102, 128, 154], // 36
	[6, 28, 54, 80, 106, 132, 158], // 37
	[6, 32, 58, 84, 110, 136, 162], // 38
	[6, 26, 54, 82, 110, 138, 166], // 39
	[6, 30, 58, 86, 114, 142, 170] // 40
];

// Version Information Table
QRCode.VERSION_INFO_TABLE = [
	0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0B9DB, 0x0C608, 0x0D921, 0x0E767,
	0x0F290, 0x109BC, 0x11622, 0x12A17, 0x13532, 0x14ED9, 0x15AD6, 0x165C9,
	0x17A83, 0x184BB, 0x19A4E, 0x1A4E1, 0x1B5ED, 0x1C690, 0x1D9B5, 0x1E7EB,
	0x1F25E, 0x20B7D, 0x218C3, 0x22B86, 0x234E9, 0x24B0B, 0x25476, 0x26A2C,
	0x27517, 0x28C69, 0x29336, 0x2A81B, 0x2B762, 0x2C45F, 0x2D704, 0x2E6B0,
	0x2F309, 0x30C47, 0x3133E, 0x32BCE, 0x33597, 0x34ED2, 0x35EF8, 0x36B0B,
	0x3775F, 0x384E8, 0x39A7F, 0x3A426, 0x3B54F, 0x3C610, 0x3D945, 0x3E78C,
	0x3F219, 0x40974, 0x4162B, 0x42AF0, 0x43525, 0x44B50, 0x4560B, 0x4688E,
	0x476D7, 0x483E0, 0x49683, 0x4A816, 0x4B76B, 0x4C358, 0x4D67D, 0x4E72B,
	0x4F2CC, 0x50B8E, 0x514D1, 0x52AA4, 0x53591, 0x54BC6, 0x55E9F, 0x56ED4,
	0x5776F, 0x5835C, 0x596C9, 0x5A85C, 0x5B72B, 0x5C422, 0x5D767, 0x5E7B3,
	0x5F206, 0x60959, 0x61606, 0x62A33, 0x6350E, 0x64B75, 0x65620, 0x66855,
	0x676E4, 0x683DA, 0x6968B, 0x6A81E, 0x6B76D, 0x6C432, 0x6D777, 0x6E7A3,
	0x6F2F6, 0x70B75, 0x7142A, 0x72A5F, 0x73564, 0x74BDB, 0x7568E, 0x768FB,
	0x7774E, 0x7821B, 0x7977E, 0x7A8C5, 0x7B7BC, 0x7C3E3, 0x7D6A6, 0x7E75E,
	0x7F20B, 0x8090D, 0x81652, 0x82AB7, 0x83582, 0x84BE9, 0x856B2, 0x868E1,
	0x8777A, 0x8820F, 0x8979A, 0x8A8CD, 0x8B7B6, 0x8C4E9, 0x8D7AC, 0x8E7F3,
	0x8F2A6, 0x90B38, 0x91467, 0x92A52, 0x93569, 0x94B10, 0x9564B, 0x9681E,
	0x9774B, 0x9823C, 0x997AD, 0x9A838, 0x9B741, 0x9C41E, 0x9D75B, 0x9E70C,
	0x9F259, 0xA0B8D, 0xA14D2, 0xA2AB7, 0xA358C, 0xA4BC9, 0xA5692, 0xA68C7,
	0xA7772, 0xA8225, 0xA9740, 0xAA8D5, 0xAB7AC, 0xAC4F3, 0xAD7B6, 0xAE7E3,
	0xAF2B6, 0xB090C, 0xB1657, 0xB2A62, 0xB355B, 0xB4BD4, 0xB5681, 0xB68D4,
	0xB7761, 0xB8230, 0xB9741, 0xBA8D4, 0xBB7AC, 0xBC4E3, 0xBD7A6, 0xBE75E,
	0xBF20B, 0xC09B6, 0xC16E9, 0xC2AEC, 0xC35D7, 0xC4B82, 0xC56D7, 0xC6822,
	0xC7797, 0xC82C0, 0xC9755, 0xCA8C0, 0xCB7F9, 0xCC4AA, 0xCD7ED, 0xCE71C,
	0xCF249, 0xD0BB8, 0xD14E7, 0xD2A72, 0xD3549, 0xD4BCD, 0xD5698, 0xD68CD,
	0xD7776, 0xD8203, 0xD9796, 0xDA803, 0xDB77A, 0xDC425, 0xDD760, 0xDE735,
	0xDF260, 0xE0BB5, 0xE14EE, 0xE2A7B, 0xE3540, 0xE4BD5, 0xE56C0, 0xE6895,
	0xE7720, 0xE8271, 0xE97E4, 0xEA851, 0xEB728, 0xEC477, 0xED732, 0xEE765,
	0xEF230, 0xF0B6F, 0xF1430, 0xF2A05, 0xF3532, 0xF4BA7, 0xF56FC, 0xF68A9,
	0xF771C, 0xF8249, 0xF97DA, 0xFA86F, 0xFB716, 0xFC449, 0xFD70C, 0xFE75B,
	0xFF20E
];

// Format Information Table
QRCode.FORMAT_INFO_TABLE = [
	0x77C4, 0x72F3, 0x7DA7, 0x7890, 0x66E9, 0x63DA, 0x642F, 0x6118,
	0x45BD, 0x40AE, 0x463B, 0x432C, 0x5154, 0x5463, 0x52EB, 0x57DC
];
