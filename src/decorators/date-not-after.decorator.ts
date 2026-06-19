import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function resolvePropertyPath(
  source: Record<string, any>,
  propertyPath: string,
): unknown {
  return propertyPath
    .split('.')
    .reduce<unknown>(
      (currentValue, segment) =>
        currentValue !== null &&
        currentValue !== undefined &&
        typeof currentValue === 'object'
          ? (currentValue as Record<string, unknown>)[segment]
          : undefined,
      source,
    );
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function DateNotAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'dateNotAfter',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = resolvePropertyPath(
            args.object as Record<string, unknown>,
            relatedPropertyName,
          );

          if (
            value === undefined ||
            value === null ||
            relatedValue === undefined ||
            relatedValue === null
          ) {
            return true;
          }

          const currentDate = toDate(value);
          const relatedDate = toDate(relatedValue);

          if (!currentDate || !relatedDate) {
            return true;
          }

          return currentDate.getTime() <= relatedDate.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;

          return `${args.property} cannot be after ${relatedPropertyName}`;
        },
      },
    });
  };
}
