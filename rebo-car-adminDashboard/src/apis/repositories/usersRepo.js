import repository from "../repository";

const resource = "users";

export default {
  getUsersWithSearchString({ page, limit, matchString }) {
    console.log({ page, limit, matchString });
    return repository.get(
      `${resource}/search?page=${page}&limit=${limit}&matchString=${matchString}`
    );
  },
  getUserById(id) {
    return repository.get(`${resource}/${id}`);
  },
  addUser(payload) {
    return repository.post(`${resource}`, payload);
  },
  updateUserById(id, payload) {
    return repository.put(`${resource}/${id}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },
  adminUpdateUserById(id, payload) {
    return repository.put(`/admin/${resource}/${id}`, payload);
  },
  activeOrBlockUserById(id) {
    console.log({ id });
    return repository.put(`/admin/${resource}/activeOrBlock/${id}`);
  },
  resetPasswordByUserId(id, payload) {
    return repository.patch(`${resource}/resetpwd/${id}`, payload, {});
  }
};
