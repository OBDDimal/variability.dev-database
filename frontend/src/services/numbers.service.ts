export default function isNumeric(value: string) {
  return /^-?\d+$/.test(value);
}
