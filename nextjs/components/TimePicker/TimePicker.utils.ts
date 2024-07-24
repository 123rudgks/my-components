import {
  HourFormat,
  TimeSection,
  TimeToken,
  TimeType,
} from '@/components/TimePicker/TimePicker.types';

export const validTimeTokens: TimeToken[] = ['hh', 'mm', 'ss', 'aa'];
// type checker for TimeToken
export const isValidTimeToken = (token: string): token is TimeToken => {
  return validTimeTokens.includes(token as TimeToken);
};
// convert TimeToken to TimeType
export const convertTokenToType = (token: TimeToken): TimeType => {
  switch (token) {
    case 'hh':
      return 'hour';
    case 'mm':
      return 'minute';
    case 'ss':
      return 'second';
    case 'aa':
      return 'ampm';
  }
};
// modify hour value to be in 12 or 24 hour format
export const modifyHourValue = (hour: string, format: HourFormat = '12') => {
  if (isNaN(Number(hour)) || Number(hour) < 0) return null;
  let hourNumber = Number(hour);

  if (hourNumber > Number(format)) return format;
  if (hourNumber < 10) return hourNumber.toString().padStart(2, '0');
  return hour;
};
// modify minute and second value to be in 0-59 range
export const modifyMinuteSecondValue = (value: string) => {
  if (isNaN(Number(value)) || Number(value) < 0) return null;
  let valueNumber = Number(value);
  if (valueNumber > 59) return '59';
  if (valueNumber < 10) return valueNumber.toString().padStart(2, '0');
  return value;
};
// modify ampm value to be in AM or PM
export const modifyAmpmValue = (value: string) => {
  if (value === 'aa') return null;
  const regExp_am = /^a/i;
  const regExp_pm = /^p/i;
  if (regExp_am.test(value)) return 'AM';
  if (regExp_pm.test(value)) return 'PM';
  return null;
};
/**
 * modify time value based on type
 * @param value
 * @param type
 * @param option
 * @returns
 */
export const modifyTimeValue = (
  value: string,
  type: TimeType,
  option?: { hourFormat?: HourFormat },
) => {
  switch (type) {
    case 'hour':
      return modifyHourValue(value, option?.hourFormat);
    case 'minute':
    case 'second':
      return modifyMinuteSecondValue(value);
    case 'ampm':
      return modifyAmpmValue(value);
    default:
      return null;
  }
};

/**
 * sections to string
 * @param sections
 * @returns string
 */
export const sectionsToStr = (sections: TimeSection[]) => {
  let value = '';
  sections.map((section) => {
    value += `${section.startSeparator}${section.value || section.token}${
      section.endSeparator
    }`;
  });
  return value;
};
// concatenate previous hour value and current hour value ( ex : 1, 2 => 12 )
export const concatenateHour = (
  prev: string,
  cur: string,
  format: HourFormat = '12',
) => {
  const prevNum = Number(prev);
  const curNum = Number(cur);
  if (prevNum > 10) {
    return modifyHourValue(cur, format);
  }
  return modifyHourValue((prevNum * 10 + curNum).toString(), format);
};
// concatenate previous minute or second value and current minute or second value ( ex : 1, 2 => 12 )
export const concatenateMinuteSecond = (prev: string, cur: string) => {
  const prevNum = Number(prev);
  const curNum = Number(cur);
  if (prevNum > 10 || prevNum * 10 + curNum > 59) {
    return modifyMinuteSecondValue(cur);
  }
  return modifyMinuteSecondValue((prevNum * 10 + curNum).toString());
};
/**
 * concatenate previous time value and current time value based on type
 * @param prevTime
 * @param currentTime
 * @param type
 * @param option
 * @returns
 */
export const concatenateTimeValue = (
  prev: string,
  cur: string,
  type: TimeType,
  option?: { hourFormat?: HourFormat },
) => {
  switch (type) {
    case 'hour':
      return concatenateHour(prev, cur, option?.hourFormat);
    case 'minute':
    case 'second':
      return concatenateMinuteSecond(prev, cur);
    case 'ampm':
      return modifyAmpmValue(cur);

    default:
      return null;
  }
};

export const regExp_firstWordInFormat = /^([a-zA-Z]+)/;
export const regExp_wordOnlyComposedOfTokens = new RegExp(
  `^(${validTimeTokens.join('|')})*$`,
);
export const regExp_firstTokenInWord = new RegExp(
  `^(${validTimeTokens.join('|')})`,
);
export const buildSectionsFromFormat = (_format: string): TimeSection[] => {
  const sections: TimeSection[] = []; // sections which is used in this function. will be passed to the sections state
  let currentStartSeparator = '';
  let i = 0;
  while (i < _format.length) {
    const remainder = _format.slice(i);
    const firstWordInFormat = regExp_firstWordInFormat.exec(remainder)?.[1];
    // if first word is only composed of tokens
    if (
      firstWordInFormat &&
      regExp_wordOnlyComposedOfTokens.test(firstWordInFormat)
    ) {
      let remainingToken = firstWordInFormat;

      while (remainingToken.length > 0) {
        const firstTokenInWord =
          regExp_firstTokenInWord.exec(remainingToken)?.[1];
        if (firstTokenInWord && isValidTimeToken(firstTokenInWord)) {
          sections.push({
            format: _format,
            token: firstTokenInWord,
            value: '',
            order: sections.length,
            maxLength: firstTokenInWord.length,
            type: convertTokenToType(firstTokenInWord),
            startSeparator: currentStartSeparator,
            endSeparator: '',
            selectionStart: i,
            selectionEnd: i + firstTokenInWord.length, // select시 마지막 index는 + 1 해줘야함. 왜 ? select index는 문자열 사이 사이를 가르키기 때문
          });
          remainingToken = remainingToken.slice(firstTokenInWord.length);
          currentStartSeparator = '';
          i += firstTokenInWord.length;
        }
      }
    }
    // if first word is not word composed of tokens ( which means it is a separator  ex: ':' )
    else {
      if (sections.length > 0) {
        sections[sections.length - 1].endSeparator = _format[i];
      } else {
        currentStartSeparator = _format[i];
      }
      i++;
    }
  }
  return sections;
};

/**
 * string을 받아서 format에 따라 처리를 한 이후에 sections로 변환
 * @param string value following the format
 * @param current sections
 * @param hour format (12 or 24)
 * @returns
 */
export const strToSections = (
  str: string,
  currentSections: TimeSection[],
  hourFormat?: HourFormat,
) => {
  let remainingVal = str;
  let i = 0;
  const tempSections = [...currentSections];
  while (i < tempSections.length) {
    const currentSection = tempSections[i];
    const regExp_sectionValueWithSeparator = new RegExp(
      `${currentSection.startSeparator}[a-zA-Z0-9]+${currentSection.endSeparator}`,
    );
    const regExp_sectionValue = new RegExp(`[a-zA-Z0-9]+`);
    const sectionValueWithSeparator =
      regExp_sectionValueWithSeparator.exec(remainingVal);
    if (sectionValueWithSeparator?.index !== undefined) {
      const sectionValue = regExp_sectionValue.exec(
        sectionValueWithSeparator?.[0],
      );
      const modifiedSectionValue = concatenateTimeValue(
        currentSection.value,
        sectionValue?.[0] ?? '',
        currentSection.type,
        {
          hourFormat: hourFormat,
        },
      );
      tempSections[i].value = modifiedSectionValue ?? '';
      remainingVal = remainingVal.slice(
        sectionValueWithSeparator.index + sectionValueWithSeparator[0].length,
      );
    }
    i++;
  }
  return tempSections;
};
/**
 * find the selected section (closest section from the selected index) and return the section
 * @param sections current sections
 * @param selectionStart
 * @param selectionEnd
 * @returns
 */
export const getSelectedSection = (
  sections: TimeSection[],
  startIdx: number | null,
  endIdx: number | null,
) => {
  const formatLength = sections[0].format.length;
  if (startIdx !== null && endIdx !== null) {
    const closestSectionIdx = sections.reduce(
      (acc, section, idx) => {
        const distance = Math.min(
          Math.abs(section.selectionStart - startIdx),
          Math.abs(section.selectionEnd - startIdx),
        );
        return distance < acc.distance ? { idx, distance } : acc;
      },

      { idx: formatLength, distance: formatLength },
    ).idx;
    const closetSection = sections[closestSectionIdx];
    return closetSection;
  } else {
    return null;
  }
};
