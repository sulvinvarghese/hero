const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const Producer = require('./models/Producer');
const Consumer = require('./models/Consumer');
const NewsClip = require('./models/NewsClip');
const WatchedTransaction = require('./models/WatchedTransaction');
const PublishedTransaction = require('./models/PublishedTransaction');
const WatchedEvent = require('./models/WatchedEvent');
const ErrorEvent = require('./models/ErrorEvent');

describe('NewsClip Network', () => {

  describe('Producer', () => {
    let producer;

    beforeEach(() => {
      producer = new Producer('Producer1');
    });

    it('should have a name', () => {
      expect(producer.name).to.equal('Producer1');
    });

    it('should start with 0 reward points', () => {
      expect(producer.rewardPoints).to.equal(0);
    });

    it('should be able to produce a NewsClip', () => {
      const newsClip = producer.produceNewsClip('Clip1', 'Description', 10);
      expect(newsClip.title).to.equal('Clip1');
      expect(newsClip.description).to.equal('Description');
      expect(newsClip.value).to.equal(10);
      expect(newsClip.producer).to.equal(producer);
    });

    it('should receive reward points when their NewsClip is watched', () => {
      const newsClip = producer.produceNewsClip('Clip1', 'Description', 10);
      const watchedTx = new WatchedTransaction(newsClip);
      producer.processTransaction(watchedTx);
      expect(producer.rewardPoints).to.equal(1);
    });

  });

  describe('Consumer', () => {
    let consumer;

    beforeEach(() => {
      consumer = new Consumer('Consumer1');
    });

    it('should have a name', () => {
      expect(consumer.name).to.equal('Consumer1');
    });

    it('should start with 0 reputation points', () => {
      expect(consumer.reputationPoints).to.equal(0);
    });

    it('should be able to watch a NewsClip', () => {
      const newsClip = new NewsClip('Clip1', 'Description', 10, new Producer('Producer1'));
      consumer.watchNewsClip(newsClip);
      expect(newsClip.views).to.equal(1);
    });

    it('should receive reputation points when they watch a NewsClip', () => {
      const newsClip = new NewsClip('Clip1', 'Description', 10, new Producer('Producer1'));
      consumer.watchNewsClip(newsClip);
      expect(consumer.reputationPoints).to.equal(1);
    });

  });

  describe('NewsClip', () => {
    let newsClip, producer;

    beforeEach(() => {
      producer = new Producer('Producer1');
      newsClip = producer.produceNewsClip('Clip1', 'Description', 10);
    });

    it('should have a title', () => {
      expect(newsClip.title).to.equal('Clip1');
    });

    it('should have a description', () => {
      expect(newsClip.description).to.equal('Description');
    });

    it('should have a value', () => {
      expect(newsClip.value).to.equal(10);
    });

    it('should have a producer', () => {
      expect(newsClip.producer).to.equal(producer);
    });

    it('should start with 0 views', () => {
      expect(newsClip.views).to.equal(0);
    });

    it('should increment views when watched', () => {
      newsClip.watch();
      expect(newsClip.views).to.equal(
