import { TimePickerProps } from '@/components/TimePicker/TimePicker';
import { TimeSection } from '@/components/TimePicker/TimePicker.types';
import {
  buildSectionsFromFormat,
  getSelectedSection,
  sectionsToStr,
  strToSections,
} from '@/components/TimePicker/TimePicker.utils';
import { useCallback, useEffect, useRef, useState } from 'react';

const useTimePicker = ({ _format, _option }: TimePickerProps) => {
  const [sections, setSections] = useState<TimeSection[]>([]);
  const [activeSection, setActiveSection] = useState<TimeSection>();
  const [value, setValue] = useState(_format);
  const ref = useRef<HTMLInputElement | null>(null);

  const setSelectionRange = useCallback(
    (start: number | null, end: number | null) => {
      ref.current?.setSelectionRange(start, end);
    },
    [],
  );

  const onBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setActiveSection(undefined);
  }, []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSections = strToSections(
        e.currentTarget.value,
        sections,
        _option?.hourFormat,
      );
      const newValue = sectionsToStr(newSections);
      setSections(newSections);
      setValue(newValue);
    },
    [_option?.hourFormat, sections],
  );
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (true) {
        case e.key === 'ArrowRight':
          e.preventDefault();
          if (activeSection) {
            const nextIdx = Math.min(
              activeSection.order + 1,
              sections.length - 1,
            );
            setSelectionRange(
              sections[nextIdx].selectionStart,
              sections[nextIdx].selectionEnd,
            );
          }
          break;
        case e.key === 'ArrowLeft':
          e.preventDefault();
          if (activeSection) {
            const nextIdx = Math.max(activeSection.order - 1, 0);
            setSelectionRange(
              sections[nextIdx].selectionStart,
              sections[nextIdx].selectionEnd,
            );
          }
          break;
        default:
          break;
      }
    },
    [activeSection, sections, setSelectionRange],
  );

  const onSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const startIdx = e.currentTarget.selectionStart;
      const endIdx = e.currentTarget.selectionEnd;
      const newActiveSection =
        getSelectedSection(sections, startIdx, endIdx) ?? undefined;
      // 새로 select된 section이 기존 active section과 다를때만 active section을 변경
      if (activeSection?.order !== newActiveSection?.order) {
        setActiveSection(newActiveSection);
      }
    },
    [sections, activeSection],
  );

  /**
   * active section에 따라 input에 selection을 적용
   * value가 변경되면 selection이 초기화 되기 때문에 value가 변경되면 selection을 다시 적용
   */
  const applySelectionToInput = useCallback(() => {
    if (activeSection) {
      setSelectionRange(
        activeSection.selectionStart,
        activeSection.selectionEnd,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, activeSection, setSelectionRange]);
  /**
   * prop으로 전달받은 format에 따라서 sections를 초기화
   */
  const initSectionsFromFormat = useCallback(() => {
    const newSections = buildSectionsFromFormat(_format);
    setSections(newSections);
  }, [_format]);

  useEffect(applySelectionToInput, [applySelectionToInput]);
  useEffect(initSectionsFromFormat, [initSectionsFromFormat]);

  return {
    ref,
    value,
    onBlur,
    onChange,
    onSelect,
    onKeyDown,
  };
};

export default useTimePicker;
