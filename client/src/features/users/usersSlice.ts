import {
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import { userApi } from './usersApi';
import { User } from '../../types/user.types';

const usersAdapter = createEntityAdapter<User>({
  selectId: (user) => user._id,
});

const initialState = usersAdapter.getInitialState();

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsers: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.getUsers.matchFulfilled,
      (state, action) => {
        usersAdapter.setAll(state, action.payload);
      }
    );

    builder.addMatcher(
      userApi.endpoints.addUser.matchFulfilled,
      (state, action) => {
        usersAdapter.addOne(state, action.payload);
      }
    );

    builder.addMatcher(
      userApi.endpoints.updateUser.matchFulfilled,
      (state, action) => {
        usersAdapter.upsertOne(state, action.payload);
      }
    );

    builder.addMatcher(
      userApi.endpoints.deleteUser.matchFulfilled,
      (state, action) => {
        usersAdapter.removeOne(state, action.meta.arg);
      }
    );
  },
});

export const { resetUsers } = userSlice.actions;
export const userReducer = userSlice.reducer;

// ✅ Selectors
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
} = usersAdapter.getSelectors((state: any) => state.users);
