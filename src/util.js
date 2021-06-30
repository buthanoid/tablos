"use strict";

export {
	TRG,
	TRG_TABLO_EXT,
	TRG_HEADER_EXT,
	TRG_LINE_EXT
}

const TRG = {
	NULL: -1,
	TABLO: 0,
	HEADER: 1,
	LINE: 2,
	CELL: 3
};

// all of these imply TRG.TABLO
// when you select a header, you have selected a tablo also
const TRG_TABLO_EXT = [ TRG.TABLO, TRG.HEADER, TRG.LINE, TRG.CELL ];
const TRG_HEADER_EXT = [ TRG.HEADER, TRG.CELL ];
const TRG_LINE_EXT = [ TRG.LINE, TRG.CELL ];