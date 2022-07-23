import moment from 'moment';

export const timestampFormat = (s: string) => {
  const date = moment(s);
  const diff = moment().diff(date, 'days');
  if (diff === 0) return date.format('H:mm');
  else if (diff < 7) return date.format('ddd');
  else return date.format('DD.MM.YYYY');
};
