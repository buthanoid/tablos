"use strict";

export {
	TRG,
	TRG_TABLO_EXT
}

const TRG = {
	NULL: -1,
	TABLO: 0,
	HEADER: 1,
	LINE: 2
};

// all of these imply TRG.TABLO
// when you select a header, you have selected a tablo also
const TRG_TABLO_EXT = [ TRG.TABLO, TRG.HEADER, TRG.LINE ];