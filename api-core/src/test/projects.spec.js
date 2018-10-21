const axios = require('axios')
const createRandomString = require('../abstractions/createRandomString.js')

const API_URL = 'http://localhost:1025/v1'

const user = {
  name: 'James',
  email: `${createRandomString()}@gamemaker.club`,
  password: createRandomString()
}

const team = {
  name: 'FatQuack'
}

const project = {
  name: 'Angry Birds'
}

const configs = {
  auth: {
    validateStatus: false,
    auth: {
      username: user.email,
      password: user.password
    }
  },
  noAuth: {
    validateStatus: false
  }
}

test('creates a user', (done) => {
  axios({
    method: 'post',
    url: `${API_URL}/users`,
    data: user,
    ...configs.noAuth
  })
    .then(response => {
      expect(response.status).toBe(201)
      user.id = response.data.id
      return done()
    })
    .catch(done)
})

test('creates a team', (done) => {
  axios({
    method: 'post',
    url: `${API_URL}/teams`,
    data: team,
    ...configs.auth
  })
    .then(response => {
      expect(response.status).toBe(201)
      expect(response.data.name).toBe(team.name)
      team.id = response.data.id
      return done()
    })
    .catch(done)
})

test('updates the users team', (done) => {
  axios({
    method: 'patch',
    url: `${API_URL}/me`,
    data: {
      teamId: team.id
    },
    ...configs.auth
  })
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.data.teamId).toBe(team.id)
      return done()
    })
    .catch(done)
})

test('creates a project', (done) => {
  axios({
    method: 'post',
    url: `${API_URL}/me/team/projects`,
    data: project,
    ...configs.auth
  })
    .then(response => {
      expect(response.status).toBe(201)
      expect(response.data.name).toBe(project.name)
      project.id = response.data.id
      return done()
    })
    .catch(done)
})

test('lists the project', (done) => {
  axios({
    method: 'get',
    url: `${API_URL}/me/team/projects`,
    ...configs.auth
  })
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(1)
      const foundProject = response.data.find(p => p.id === project.id)
      expect(typeof foundProject).toBe('object')
      return done()
    })
    .catch(done)
})

describe('resources', () => {
  test('lists none', (done) => {
    axios({
      method: 'get',
      url: `${API_URL}/me/team/projects/${project.id}/resources`,
      ...configs.auth
    })
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data).toHaveLength(0)
        return done()
      })
      .catch(done)
  })

  test('doesnt add one with a stupid type', (done) => {
    axios({
      method: 'post',
      url: `${API_URL}/me/team/projects/${project.id}/resources`,
      data: {
        type: 'qweqweqwe'
      },
      ...configs.auth
    })
      .then(response => {
        expect(response.status).toBe(400)
        expect(response.data.message).toBe('this would not get created ([classes.factory] [resource] i dont understand resource type \'qweqweqwe\')')
        return done()
      })
      .catch(done)
  })

  let resourceId
  test('adds one', (done) => {
    axios({
      method: 'post',
      url: `${API_URL}/me/team/projects/${project.id}/resources`,
      data: {
        type: 'sound',
        name: 'Bird Sound'
      },
      ...configs.auth
    })
      .then(response => {
        expect(response.status).toBe(201)
        expect(response.data.type).toBe('sound')
        expect(response.data.name).toBe('Bird Sound')
        resourceId = response.data.id
        return done()
      })
      .catch(done)
  })

  test('lists one', (done) => {
    axios({
      method: 'get',
      url: `${API_URL}/me/team/projects/${project.id}/resources`,
      ...configs.auth
    })
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data).toHaveLength(1)
        const foundResource = response.data.find(r => r.id === resourceId)
        expect(typeof foundResource).toBe('object')
        return done()
      })
      .catch(done)
  })

  test('deletes it', (done) => {
    axios({
      method: 'delete',
      url: `${API_URL}/me/team/projects/${project.id}/resources/${resourceId}`,
      ...configs.auth
    })
      .then(response => {
        expect(response.status).toBe(204)
        return done()
      })
      .catch(done)
  })

  test('lists none after deletion', (done) => {
    axios({
      method: 'get',
      url: `${API_URL}/me/team/projects/${project.id}/resources`,
      ...configs.auth
    })
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data).toHaveLength(0)
        return done()
      })
      .catch(done)
  })
})

test('deletes the project', (done) => {
  axios({
    method: 'delete',
    url: `${API_URL}/me/team/projects/${project.id}`,
    ...configs.auth
  })
    .then(response => {
      expect(response.status).toBe(204)
      return done()
    })
    .catch(done)
})

test('doesnt list the project', (done) => {
  axios({
    method: 'get',
    url: `${API_URL}/me/team/projects`,
    ...configs.auth
  })
    .then(response => {
      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(0)
      return done()
    })
    .catch(done)
})

test('deletes the team', (done) => {
  axios({
    method: 'delete',
    url: `${API_URL}/me/team`,
    ...configs.auth
  })
    .then(response => {
      expect(response.status).toBe(204)
      return done()
    })
    .catch(done)
})

test('deletes the user', (done) => {
  axios({
    method: 'delete',
    url: `${API_URL}/me`,
    ...configs.auth
  })
    .then(response => {
      expect(response.status).toBe(204)
      return done()
    })
    .catch(done)
})
