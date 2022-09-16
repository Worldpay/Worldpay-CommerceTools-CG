'use strict'

const ISO_3611_2 = [
  // China
  { code: 'CN-AH', name: '安徽省' },
  { code: 'CN-BJ', name: '北京市' },
  { code: 'CN-CQ', name: '重庆市' },
  { code: 'CN-FJ', name: '福建省' },
  { code: 'CN-GD', name: '广东省' },
  { code: 'CN-GS', name: '甘肃省' },
  { code: 'CN-GX', name: '广西壮族自治区' },
  { code: 'CN-GZ', name: '贵州省' },
  { code: 'CN-HA', name: '河南省' },
  { code: 'CN-HB', name: '湖北省' },
  { code: 'CN-HE', name: '河北省' },
  { code: 'CN-HI', name: '海南省' },
  { code: 'CN-HK', name: '香港特别行政区' },
  { code: 'CN-HL', name: '黑龙江省' },
  { code: 'CN-HN', name: '湖南省' },
  { code: 'CN-JL', name: '吉林省' },
  { code: 'CN-JS', name: '江苏省' },
  { code: 'CN-JX', name: '江西省' },
  { code: 'CN-LN', name: '辽宁省' },
  { code: 'CN-NM', name: '内蒙古自治区' },
  { code: 'CN-NX', name: '宁夏回族自治区' },
  { code: 'CN-QH', name: '青海省' },
  { code: 'CN-SC', name: '四川省' },
  { code: 'CN-SD', name: '山东省' },
  { code: 'CN-SH', name: '上海市' },
  { code: 'CN-SN', name: '陕西省' },
  { code: 'CN-SX', name: '山西省' },
  { code: 'CN-TJ', name: '天津市' },
  { code: 'CN-TW', name: '台湾省' },
  { code: 'CN-XJ', name: '新疆维吾尔自治区' },
  { code: 'CN-XZ', name: '西藏自治区' },
  { code: 'CN-YN', name: '云南省' },
  { code: 'CN-ZJ', name: '浙江省' },

  // US
  { code: 'US-AL', name: 'alabama' },
  { code: 'US-AK', name: 'alaska' },
  { code: 'US-AZ', name: 'arizona' },
  { code: 'US-AR', name: 'arkansas' },
  { code: 'US-CA', name: 'california' },
  { code: 'US-CO', name: 'colorado' },
  { code: 'US-CT', name: 'connecticut' },
  { code: 'US-DE', name: 'delaware' },
  { code: 'US-FL', name: 'florida' },
  { code: 'US-GA', name: 'georgia' },
  { code: 'US-HI', name: 'hawaii' },
  { code: 'US-ID', name: 'idaho' },
  { code: 'US-IL', name: 'illinois' },
  { code: 'US-IN', name: 'indiana' },
  { code: 'US-IA', name: 'iowa' },
  { code: 'US-KS', name: 'kansas' },
  { code: 'US-KY', name: 'kentucky' },
  { code: 'US-LA', name: 'louisiana' },
  { code: 'US-ME', name: 'maine' },
  { code: 'US-MD', name: 'maryland' },
  { code: 'US-MA', name: 'massachusetts' },
  { code: 'US-MI', name: 'michigan' },
  { code: 'US-MN', name: 'minnesota' },
  { code: 'US-MS', name: 'mississippi' },
  { code: 'US-MO', name: 'missouri' },
  { code: 'US-MT', name: 'montana' },
  { code: 'US-NE', name: 'nebraska' },
  { code: 'US-NV', name: 'nevada' },
  { code: 'US-NH', name: 'new hampshire' },
  { code: 'US-NJ', name: 'new jersey' },
  { code: 'US-NM', name: 'new mexico' },
  { code: 'US-NY', name: 'new york' },
  { code: 'US-NC', name: 'north carolina' },
  { code: 'US-ND', name: 'north dakota' },
  { code: 'US-OH', name: 'ohio' },
  { code: 'US-OK', name: 'oklahoma' },
  { code: 'US-OR', name: 'oregon' },
  { code: 'US-PA', name: 'pennsylvania' },
  { code: 'US-RI', name: 'rhode island' },
  { code: 'US-SC', name: 'south carolina' },
  { code: 'US-SD', name: 'south dakota' },
  { code: 'US-TN', name: 'tennessee' },
  { code: 'US-TX', name: 'texas' },
  { code: 'US-UT', name: 'utah' },
  { code: 'US-VT', name: 'vermont' },
  { code: 'US-VA', name: 'virginia' },
  { code: 'US-WA', name: 'washington' },
  { code: 'US-WV', name: 'west virginia' },
  { code: 'US-WI', name: 'wisconsin' },
  { code: 'US-WY', name: 'wyoming' },
  { code: 'US-DC', name: 'district of columbia' },
  { code: 'US-AS', name: 'american samoa' },
  { code: 'US-GU', name: 'guam' },
  { code: 'US-MP', name: 'northern mariana islands' },
  { code: 'US-PR', name: 'puerto rico' },
  { code: 'US-UM', name: 'united states minor outlying islands' },
  { code: 'US-VI', name: 'u.s. virgin islands' },
]

/**
 * Looks up an ISO-3611-2 state code from a state name
 * Note: only gives a value if case the state is listed in the table above (US / CN only at the time of writing)
 *
 * @param {string} name The name of the state
 * @returns {string} The code of the state, or undefined
 */
function lookupISO_3611_2_State(name) {
  const lowerName = name?.toLowerCase()
  const found = ISO_3611_2.find((value) => value.name === lowerName)
  return found?.code
}

/**
 * Is a state's value compliant with the ISO-3611-2 values.
 * Note: only responds with `true` if the value is listed in the table above.
 *
 * @param {string} code
 * @returns {boolean} True if the state complies with ISO-3611-2
 */
function compliesWithISO_3611_2(code) {
  return ISO_3611_2.some((value) => value.code === code)
}

module.exports = { lookupISO_3611_2_State, compliesWithISO_3611_2 }
