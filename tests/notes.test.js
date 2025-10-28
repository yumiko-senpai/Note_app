const request = require('supertest');
const app = require('../server/app');

const registerAndLogin = async () => {
  const user = {
    name: 'Note User',
    email: 'note@example.com',
    password: 'password123',
  };

  await request(app).post('/api/auth/register').send(user);
  const loginRes = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: user.password,
  });

  return loginRes.body.token;
};

describe('Notes API', () => {
  it('creates and fetches notes', async () => {
    const token = await registerAndLogin();

    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'First Note', content: 'Hello world' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.title).toBe('First Note');

    const fetchRes = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.length).toBe(1);
  });

  it('updates and deletes a note', async () => {
    const token = await registerAndLogin();

    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Temp', content: 'Temp content' });

    const noteId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated', content: 'Updated content' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Updated');

    const deleteRes = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Note deleted');
  });
});
