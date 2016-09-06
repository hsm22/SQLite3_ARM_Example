function registerBackgroundTasks() {

    var _isRegistered = false,
    _bgTaskName = "our task",
    _appModel = Windows.ApplicationModel,
    _background = _appModel.Background,
    _registeredTasks = _background.BackgroundTaskRegistration.allTasks.first(),
    task;

    //loop throught all of the tasks and find out who is already registered
    while (_registeredTasks.hasCurrent) {
        var task = _registeredTasks.current.value;
        if (task.name === _bgTaskName) {
            _isRegistered = true;
            break;
        }

        _registeredTasks.moveNext();
    }

    if (!_isRegistered) {
        var taskBuilder = new _background.BackgroundTaskBuilder();

        var taskTrigger = new _background.SystemTrigger(
            _background.SystemTriggerType.timeZoneChange, false);

        taskBuilder.name = _bgTaskName;
        taskBuilder.taskEntryPoint = "www\\js\\BackgroundTask.js";
        //taskBuilder.setTrigger(taskTrigger);

        var timeTrigger = new _background.TimeTrigger(15, false)

        taskBuilder.setTrigger(timeTrigger);


        taskBuilder.addCondition(
                new _background.SystemCondition(
                _background.SystemConditionType.internetAvailable));

        _background.BackgroundExecutionManager.requestAccessAsync();


        /*
            do we add any conditions here...

            taskBuilder.addConditions(
                new _background.SystemCondition(
                _background.SystemConditionType.userPresent));
        */

        task = taskBuilder.register();
    }


}

//Main page
function onDeviceReady() {
   
    registerBackgroundTasks();
    
    var dbPath = Windows.Storage.ApplicationData.current.localFolder.path + '\\db.sqlite';
    SQLite3JS.openAsync(dbPath)
    .then(function (db) {
        return db.runAsync('CREATE TABLE Item (name TEXT, price REAL, id INT PRIMARY KEY)')
        .then(function () {
            return db.runAsync('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Mango', 4.6, 123]);
        })
        .then(function () {
            return db.eachAsync('SELECT * FROM Item', function (row) {
                console.log('Get a ' + row.name + ' for $' + row.price);
            });
        })
        .then(function () {
            db.close();
        });
    });

}