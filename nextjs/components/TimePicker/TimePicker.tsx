'use client';

import {
  DEFAULT_TIME_FORMAT,
  HourFormat,
} from '@/components/TimePicker/TimePicker.types';
import useTimePicker from '@/components/TimePicker/useTimePicker';

export type TimePickerProps = {
  _format?: string;
  _option?: {
    hourFormat?: HourFormat;
  };
};

const TimePicker = ({
  _format = DEFAULT_TIME_FORMAT,
  _option,
}: TimePickerProps) => {
  const timePickerProps = useTimePicker({ _format, _option });

  return (
    <div>
      <input {...timePickerProps} />
    </div>
  );
};

export default TimePicker;
