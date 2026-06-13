import { Transform } from 'class-transformer';

type TrimOptions = {
  emptyToNull?: boolean;
};

export function Trim(options: TrimOptions = {}) {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      if (options.emptyToNull && trimmedValue === '') {
        return null;
      }

      return trimmedValue;
    }

    return value;
  });
}
