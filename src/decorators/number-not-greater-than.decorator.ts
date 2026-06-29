import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function resolvePropertyPath(
  source: Record<string, unknown>,
  propertyPath: string,
): unknown {
  return propertyPath.split('.').reduce<unknown>((currentValue, segment) => {
    if (
      currentValue !== null &&
      currentValue !== undefined &&
      typeof currentValue === 'object'
    ) {
      return (currentValue as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsedNumber = Number(value);
    return Number.isFinite(parsedNumber) ? parsedNumber : null;
  }

  return null;
}

export function NumberNotGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      name: 'numberNotGreaterThan',
      target: object.constructor,
      propertyName: String(propertyName),
      constraints: [property],
      options: validationOptions,
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

          const currentNumber = toNumber(value);
          const relatedNumber = toNumber(relatedValue);

          if (currentNumber === null || relatedNumber === null) {
            return true;
          }

          return currentNumber <= relatedNumber;
        },

        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;

          return `${args.property} cannot be greater than ${relatedPropertyName}`;
        },
      },
    });
  };
}
