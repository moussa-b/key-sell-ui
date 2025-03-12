import { UserAccess } from '../../core/models/user-access.model';
import { LabelValue } from '../../core/models/label-value.model';

export interface UserAccessConfiguration {
  userAccess?: UserAccess; // actual user access
  roleUserAccess: UserAccess; // fields with value false must be disabled in front-end side
  groups: UserAccessGroup[];
}

export interface UserAccessGroup {
  label: string;
  fields: LabelValue<string>[];
}
