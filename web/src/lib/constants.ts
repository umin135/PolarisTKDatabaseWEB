
// ---------------------------------------------------------------------------
// Hash lookup tables
// ---------------------------------------------------------------------------

export const CHAR_HASH: Record<number, string> = {
  26846036:   'ZBR', 97192667:   'CTR', 236224321:  'TTR', 310559474:  'HRS',
  731112246:  'KMD', 748126445:  'PGN', 761728323:  'WKZ', 823174094:  'CHT',
  840871906:  'LON', 1009826274: 'AML', 1066975102: 'KAL', 1230214467: 'SWL',
  1281269543: 'CRW', 1575337196: 'BEE', 1597287972: 'JLY', 1633518270: 'RBT',
  1791216549: 'ANT', 1806241895: 'OKM', 1862528861: 'LZD', 1870866276: 'HMS',
  1941891036: 'CML', 2046353711: 'BBN', 2172508408: 'MNT', 2262000005: 'GHP',
  2508721799: 'TGR', 2620373223: 'DER', 2691931401: 'CCN', 2802412287: 'GRF',
  3013172036: 'CBR', 3098177400: 'CAT', 3109625382: 'SNK', 3155198250: 'BSN',
  3269129674: 'GOT', 3283482507: 'GRL', 3302278637: 'KGR', 3480598787: 'WLF',
  3651497509: 'DOG', 3716978005: 'RAT', 3826916785: 'KLW', 3908942186: 'KNK',
  3909547504: 'PIG', 2897068730: 'DEK', 2492561663: 'CMN', 1489967222: 'XXA',
  1000005316: 'XXB', 3374534069: 'XXC', 1859904795: 'XXD', 2243376126: 'XXE',
  2887689737: 'XXF', 694498012:  'XXG', 3099443275: 'KER',
}

export const ITEM_POS_HASH: Record<number, string> = {
  398673939:  'gla', 784860974:  'btm', 952745790:  'bdf', 1291920003: 'fac',
  1575090356: 'ex0', 2118278548: 'ex1', 2325958612: 'hed', 2562980590: 'ex2',
  2682927175: 'har', 2731567485: 'hef', 3083618261: 'eff', 3104230581: 'fah',
  3216997551: 'acc', 3672180440: 'ex3', 3859820991: 'bdu', 4277548013: 'ara',
  472135170:  'sho', 32350386:   'stn', 164982311:  'stg', 2086639496: 'lip',
  4136406133: 'eye', 2715668717: 'chk', 1208725833: 'fap', 2615564137: 'eym',
  2462554855: 'none', 3229833922: 'NONE',
}

export const SERIES_HASH: Record<number, string> = {
  2607418557: 'TK1', 1374241517: 'TK2', 1802801095: 'TK3', 2533226375: 'TTT',
  2337280880: 'TK4', 2080240599: 'TK5', 3084700453: 'TK6', 58512809:   'TTT2',
  2372343475: 'TKR', 1515707469: 'TK7', 2641885965: 'TK8',
}


// ---------------------------------------------------------------------------
// Display constants
// ---------------------------------------------------------------------------


export const ITEM_POS_LABEL: Record<string, string> = {
  hed: 'Head',        har: 'Hair',         hef: 'Full-Face',
  fah: 'Face hair',   fac: 'Face',         fap: 'Face Paint',
  eye: 'Eyes',        eym: 'Eye makeup',   lip: 'Lips',
  chk: 'Cheeks',      bdu: 'Upper body',   bdf: 'Entire body',
  btm: 'Lower body',  gla: 'Glasses',      sho: 'Shoes',
  ara: 'Aura',        acc: 'Accessory',    eff: 'Hit Effect',
  stg: 'Stage',       stn: 'Suntan',
  ex0: 'Unique 1',     ex1: 'Unique 2',      ex2: 'Unique 3',   ex3: 'Unique 4',
  none: 'none',          NONE: 'NONE',
}

export const ITEM_POS_COLORS: Record<string, string> = {
  hed: '#a78bfa', har: '#a78bfa', hef: '#a78bfa',
  fah: '#f9a8d4', fac: '#f9a8d4', fap: '#f9a8d4',
  eye: '#f9a8d4', eym: '#f9a8d4', lip: '#f9a8d4', chk: '#f9a8d4',
  bdu: '#60a5fa', bdf: '#60a5fa',
  btm: '#34d399', gla: '#34d399',
  sho: '#fb923c',
  ara: '#c084fc', acc: '#fbbf24', eff: '#fbbf24',
  stg: '#94a3b8', stn: '#94a3b8',
  ex0: '#64748b', ex1: '#64748b', ex2: '#64748b', ex3: '#64748b',
}
