"use strict";

export {
	TRG,
	TRG_TABLO_EXT,
	TRG_HEADER_EXT,
	TRG_LINE_EXT
}

const TRG = {
	NULL: "TRG.NULL",
	TABLO: "TRG.TABLO",
	HEADER: "TRG.HEADER",
	LINE: "TRG.LINE",
	CELL: "TRG.CELL"
};

// when you select a header, you have selected a tablo also. etc
const TRG_TABLO_EXT = [ TRG.TABLO, TRG.HEADER, TRG.LINE, TRG.CELL ];
const TRG_HEADER_EXT = [ TRG.HEADER, TRG.CELL ];
const TRG_LINE_EXT = [ TRG.LINE, TRG.CELL ];

