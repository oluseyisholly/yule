import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'OnlyOneBaseUnit', async: false })
export class OnlyOneBaseUnitConstraint
  implements ValidatorConstraintInterface
{
  validate(units: any[], args: ValidationArguments) {
    if (!units || !Array.isArray(units)) return true;

    const baseUnits = units.filter(
      (unit) => unit?.isBaseUnit === true,
    );

    return baseUnits.length <= 1;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Only one commodity unit can have isBaseUnit set to true';
  }
}