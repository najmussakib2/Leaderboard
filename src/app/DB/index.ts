import { USER_ROLE } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';

const investor = {
  name: 'investor',
  email: 'investor@gmail.com',
  password: 12345,
  role: USER_ROLE.investor,
  status: 'in-progress',
  isDeleted: false,
};
const admin = {
  name: 'admin',
  email: 'admin@gmail.com',
  password: 12345,
  role: USER_ROLE.admin,
  status: 'in-progress',
  isDeleted: false,
};

const seedSuperUser = async () => {

  const isInvestorExist = await User.findOne({ role: USER_ROLE.investor });
  
  if (!isInvestorExist) {
    await User.create(investor);
  }

  const isAdminExist = await User.findOne({ role: USER_ROLE.admin });

  if (!isAdminExist) {
    await User.create(admin);
  }
};

export default seedSuperUser;
