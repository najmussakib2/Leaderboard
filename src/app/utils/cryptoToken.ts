import crypto from 'crypto';

const cryptoToken = (numb: number = 32) => {
  return crypto.randomBytes(numb).toString('hex');
};

export default cryptoToken;
