(function (LB) {
  const boards = [
    { source: LB.SOURCES.robotwin, init: LB.initRoboTwinBoard, errorAt: '#rankTable tbody' },
    { source: LB.SOURCES.robodojo, init: LB.initRoboDojoBoard, errorAt: '#dojoTable tbody' },
    { source: LB.SOURCES.robodojoReal, init: LB.initRoboDojoRealBoard, errorAt: '#dojoRealTable tbody' },
  ];

  boards.forEach(({ source, init, errorAt }) => {
    LB.loadBoard(source)
      .then(init)
      .catch((err) => {
        console.error(err);
        LB.renderBoardError(errorAt, source.url, err);
      });
  });
})(window.RoboTwinLB);
