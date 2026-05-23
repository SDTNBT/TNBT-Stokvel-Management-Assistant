require('dotenv').config({ path: '.env.test', override: true });

const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');

const Group = require('../models/Group');
const Member = require('../models/Member');
const Notification = require('../models/Notification');
const Meeting = require('../models/Meeting');
const Agenda = require('../models/Agenda');

jest.setTimeout(30000);

describe('Meeting and Agenda Notifications', () => {
    let group;

    beforeAll(async () => {
        const testUri = process.env.MONGO_URI && process.env.MONGO_URI.includes('stokvel_test_db')
            ? process.env.MONGO_URI
            : 'mongodb+srv://stokveltest:thetest2026@cluster200.l91gxta.mongodb.net/stokvel_test_db?retryWrites=true&w=majority';
        await connectDB(testUri);
    });

    beforeEach(async () => {
        await Notification.deleteMany({});
        await Meeting.deleteMany({});
        await Agenda.deleteMany({});
        await Member.deleteMany({});
        await Group.deleteMany({});

        group = await Group.create({
            groupName: 'Test Group',
            adminEmail: 'admin@test.com',
            treasurerEmail: 'treasurer@test.com',
            contributionAmount: 300,
            frequency: 'Monthly'
        });

        await Member.create([
            { user: 'member1@test.com', group: 'Test Group', memberType: 'Member' },
            { user: 'member2@test.com', group: 'Test Group', memberType: 'Member' }
        ]);
    });

    afterAll(async () => {
        await Notification.deleteMany({});
        await Meeting.deleteMany({});
        await Agenda.deleteMany({});
        await Member.deleteMany({});
        await Group.deleteMany({});
        await mongoose.connection.close();
    });

    test('scheduling a meeting creates notifications for group members', async () => {
        const response = await request(app)
            .post('/api/meetings/schedule')
            .send({
                groupId: group._id.toString(),
                meetingTitle: 'Monthly Meeting',
                purpose: 'Discuss monthly contributions',
                meetingDate: '2026-05-20',
                startTime: '10:00',
                endTime: '11:00',
                locationType: 'online',
                platform: 'zoom',
                meetingLink: 'https://zoom.test/meeting',
                physicalLocation: ''
            });

        expect(response.statusCode).toBe(201);

        // Check notifications were created — at least 1 for the group
        const notifications = await Notification.find({
            groupId: group._id.toString()
        });

        expect(notifications.length).toBeGreaterThanOrEqual(1);
        expect(notifications[0].isRead).toBe(false);
    });

    test('posting an agenda creates announcement notifications for group members', async () => {
        const response = await request(app)
            .post('/api/meetings/agenda')
            .send({
                groupId: group._id.toString(),
                title: 'May Agenda',
                date: '2026-05-20',
                time: '09:00',
                agenda: '<p>Discuss savings and payouts</p>'
            });

        expect(response.statusCode).toBe(201);

        // Check at least 1 notification was created for the group
        const notifications = await Notification.find({
            groupId: group._id.toString()
        });

        expect(notifications.length).toBeGreaterThanOrEqual(1);
        expect(notifications[0].isRead).toBe(false);
    });
});