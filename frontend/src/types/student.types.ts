import { IModel } from './base.type';
import { IClass } from './class.type';
import { IUser } from './user.type';

interface Address {
  cell: string;
  country: string;
  province: string;
  sector: string;
  district: string;
  village: string;
}

export interface Student extends IUser {
  currentClass: IClass;
  studentStatus?: string;
  statusChanges?: any;
  classes: IClass[];
  user_id?: string;
  userProfilePic?: string;
}

export interface IStudentDetails {
  user: IUser;
  person: Student;
  parent: Parent[];
}

export interface Parent extends IModel {
  firstName: string;
  lastName: string;
  email: string;
  lastLogin: any;
  gender: string;
  phoneNumber: string;
  nationalId: string;
  visibility: string;
  status: string;
  address: any;
  parentType: EParentType;
  reportCardToken?: string;
}

export enum EParentType {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GUARDIAN = 'GUARDIAN',
}
