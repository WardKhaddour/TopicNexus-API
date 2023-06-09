import { Request, Response, NextFunction } from 'express';
import { OK } from '../../constants';

const logout = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('jwt');
  res.status(OK).json({
    success: true,
    message: req.i18n.t('userAuthMsg.loggedOutSuccess'),
    data: null,
  });
};

export default logout;
