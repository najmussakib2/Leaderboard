import crypto from 'crypto';

const cryptoToken = (numb: number = 32) => {
  return crypto.randomBytes(numb).toString('hex');
};

export default cryptoToken;


const secret = cryptoToken(10);
console.log(secret);