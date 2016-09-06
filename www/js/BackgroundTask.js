
(function () {
    "use strict";

    importScripts('/www/js/base.js');
    importScripts('/www/js/SQLite3.js');

    // importScripts('/www/plugins/com.msopentech.websql/js/SQLite3.js');
    //
    // The background task instance's activation parameters are available via Windows.UI.WebUI.WebUIBackgroundTaskInstance.current
    //
    var cancel = false,
        progress = 0,
        backgroundTaskInstance = Windows.UI.WebUI.WebUIBackgroundTaskInstance.current,
        path = Windows.Storage.ApplicationData.current.localFolder.path + '\\Database',
        url = null,
        uuid = null;

    console.log("Background " + backgroundTaskInstance.task.name + " Starting...");

    //
    // Associate a cancellation handler with the background task.
    //
    function onCanceled(cancelSender, cancelReason) {
        cancel = true;
    }
    backgroundTaskInstance.addEventListener("canceled", onCanceled);

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

    var ajax = {};
    ajax.x = function () {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        var versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];

        var xhr;
        for (var i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
        return xhr;
    };

    ajax.send = function (url, callback, method, data, async) {
        if (async === undefined) {
            async = true;
        }
        var x = ajax.x();
        try{
            x.open(method, url, async);
            x.onreadystatechange = function () {
                if (x.readyState == 4) {
                    callback(x.responseText)
                }
            };
            if (method == 'POST') {
                x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
            x.send(data)
        }
        catch (e) {
            console.log(e.message);
        }
    };

    ajax.get = function (url, data, callback, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
    };

    ajax.post = function (url, data, callback, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url, callback, 'POST', query.join('&'), async)
    };
    var value = null;
    var res = null;
    var res1 = null;



    function file2Base64(filename) {
        var reader = new FileReader();
        reader.onload = function (fileLoadedEvent) {
            console.log(fileLoadedEvent.target.result);
            return fileLoadedEvent.target.result;
        };

        var uri = new Windows.Foundation.Uri(filename);
        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
            console.log(file.name);
            if (file) {
                reader.readAsDataURL(file);
            }
            else {
                return null;
            }

        });
    }

    

    

    
    /*

    getURL();
    getUUID();

    function onSQLJSONPackets() {
        sendGPS();
        SQLite3JS
			.openAsync(path)
			.then(function (db) {
			    return db
					.allAsync("SELECT * FROM JSON_PACKETS ORDER BY ID ASC")
					.then(function (results) {
					    //console.log(JSON.stringify(results));
					    res = JSON.stringify(results);
					    db.close();
					    return results;
					}, function (error) {
					    console.error(error);
					});

			})
			.then(function () {

			    progress = 33;
			    backgroundTaskInstance.progress = progress;

			    var results = JSON.parse(res);
			    var len = results.length,
						i = 0;
			    sendJSONPackets(url, results, i, len);
			    

			})

    }


    function onSQLJSONPics() {
        SQLite3JS
			.openAsync(path)
			.then(function (db) {
			    return db
					.allAsync("SELECT * FROM PICTURES ORDER BY ID ASC")
					.then(function (results) {
					    //console.log(JSON.stringify(results));
					    res1 = JSON.stringify(results);
					    db.close();
					    return results;
					}, function (error) {
					    console.error(error);
					});

			})
			.then(function () {


			    progress = 66;
			    backgroundTaskInstance.progress = progress;

			    var results = JSON.parse(res1);
			    var len = results.length,
						i = 0;
			    sendJSONPics(url, results, i, len);
			   

			})

    }


    function onSQLJSONFiles() {
        SQLite3JS
			.openAsync(path)
			.then(function (db) {
			    return db
					.allAsync("SELECT * FROM PICTURES_URI ORDER BY ID ASC")
					.then(function (results) {
					    //console.log(JSON.stringify(results));
					    res1 = JSON.stringify(results);
					    db.close();
					    return results;
					}, function (error) {
					    console.error(error);
					});

			})
			.then(function () {


			    progress = 100;
			    backgroundTaskInstance.progress = progress;

			    var results = JSON.parse(res1);
			    var len = results.length,
						i = 0;
			    //console.log(len);
			    if (len > 0) {
			        sendJSONFiles(url, results, i, len);
			    }
			    else {
			        backgroundTaskInstance.succeeded = (progress === 100);
			        value = backgroundTaskInstance.succeeded ? "Completed" : "Canceled";
			        console.log("Background " + backgroundTaskInstance.task.name + value);
			        close();
			    }

			})

    }

   
    function getURL() {
        SQLite3JS
			.openAsync(path)
			.then(function (db) {
			    return db
					.allAsync("SELECT * FROM URL")
					.then(function (results) {
					    //console.log(JSON.stringify(results));
					    if (results.length > 0) {
					        url = results[0].URL;
					    }
					    else {
					        backgroundTaskInstance.succeeded = (progress === 100);
					        value = backgroundTaskInstance.succeeded ? "Completed" : "Canceled";
					        console.log("Background " + backgroundTaskInstance.task.name + value);
					        close();

					    }
					    //console.log(url);
					    db.close();
					    return results;
					}, function (error) {
					    console.error(error);
					});

			})
    }


    function getUUID() {
        SQLite3JS
			.openAsync(path)
			.then(function (db) {
			    return db
					.allAsync("SELECT * FROM PARAMETER")
					.then(function (results) {
					    //console.log(JSON.stringify(results));
					    if (results.length > 0) {
					        uuid = results[0].IMEI;
                            console.log(uuid)
					    }
					    else {
					        console.log("UUID not found ");
					        close();

					    }
					    //console.log(url);
					    db.close();
					    return results;
					}, function (error) {
					    console.error(error);
					});

			})
    }
    function onDelJSONPacket(rowID) {

        SQLite3JS
			.openAsync(path)
			.then(function (db) {
			    return db
					.allAsync("DELETE FROM JSON_PACKETS WHERE ID = '" + rowID + "'")
					.then(function (results) {
					    db.close();
					    //console.log("row deleted");
					}, function (error) {
					    console.error(error);
					});

			})

    }


    function onDelJSONPic(rowID) {


        SQLite3JS
			.openAsync(path)
			.then(function (db) {
			    return db
					.allAsync("DELETE FROM PICTURES WHERE ID = '" + rowID + "'")
					.then(function (results) {
					    db.close();
					    console.log("row deleted");
					}, function (error) {
					    console.error(error);
					});

			})

    }


    function onDelJSONFile(rowID) {


        SQLite3JS
			.openAsync(path)
			.then(function (db) {
			    return db
					.allAsync("DELETE FROM PICTURES_URI WHERE ID = '" + rowID + "'")
					.then(function (results) {
					    db.close();
					    console.log("row deleted");
					}, function (error) {
					    console.error(error);
					});

			})

    }

    function sendJSONPics(url, results, i, len) {
        console.log(i);
        console.log(len);
        console.log(JSON.stringify(results));
        if (len > 0) {
            ajax.post(url, {
                method: 'PIC',
                data: results[i].JSON_DATA,
                packSEQ: results[i].IMAGE_ID,
                rowid: results[i].ID
            }, function (d) {
                var data = JSON.parse(d);
                var applicationData = Windows.Storage.ApplicationData.current;
                var localSettings = applicationData.localSettings;
                console.log(data.success);
                if (data.success == "Y") {
                    onDelJSONPic(data.rowID);
                }
                i++;
                if (i < len) {
                    sendJSONPics(url, results, i, len);
                }
                else {
                    setTimeout(onSQLJSONFiles, 1000);
                }

            });
        }
        else {

            setTimeout(onSQLJSONFiles, 1000);

        }
    }

    function sendJSONFiles(url, results, i, len) {
        console.log(i);
        console.log(len);


        var reader = new FileReader();
        reader.onload = function (fileLoadedEvent) {
           
            var photo = fileLoadedEvent.target.result;
            photo = photo.replace(/^data:image\/(png|jpeg);base64,/, "");
            var myObj = {};
            myObj["filename"] = results[i].IMAGE_ID;
            myObj["type"] = "P";
            myObj["photo"] = photo;

            var jsonData = JSON.stringify(myObj);


            if (len > 0 && photo.length > 0) {
                ajax.post(url, {
                    method: 'PIC',
                    data: jsonData,
                    packSEQ: results[i].IMAGE_ID,
                    rowid: results[i].ID
                }, function (d) {
                    var data = JSON.parse(d);
                    var applicationData = Windows.Storage.ApplicationData.current;
                    var localSettings = applicationData.localSettings;
                    console.log(data.success);
                    if (data.success == "Y") {
                        onDelJSONFile(data.rowID);
                    }
                    i++;
                    if (i < len) {
                        sendJSONFiles(url, results, i, len);
                    }
                    else {
                        backgroundTaskInstance.succeeded = (progress === 100);
                        value = backgroundTaskInstance.succeeded ? "Completed" : "Canceled";
                        console.log("Background " + backgroundTaskInstance.task.name + value);

                        //
                        // A JavaScript background task must call close when it is done.
                        //
                        //
                        setTimeout(close, 1000);
                    }

                });
            }
            else {

                backgroundTaskInstance.succeeded = (progress === 100);
                value = backgroundTaskInstance.succeeded ? "Completed" : "Canceled";
                console.log("Background " + backgroundTaskInstance.task.name + value);

                //
                // A JavaScript background task must call close when it is done.
                //
                //
                setTimeout(close, 10000);

            }
        };

        var uri = new Windows.Foundation.Uri(results[i].FILE_URI);
        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
            console.log(file.name);
            if (file) {
                reader.readAsDataURL(file);
            }

        });


    }

    function sendJSONPackets(url, results, i, len) {
        console.log(i);
        console.log(len);
        console.log(JSON.stringify(results));
        if (len > 0) {
            ajax.post(url, {
                method: results[i].EVENT,
                data: results[i].JSON_DATA,
                packSEQ: results[i].SEQ,
                rowid: results[i].ID
            }, function (d) {
                var data = JSON.parse(d);
                var applicationData = Windows.Storage.ApplicationData.current;
                var localSettings = applicationData.localSettings;
                console.log(data.success);
                if (data.success == "Y") {
                    onDelJSONPacket(data.rowID);
                }
                i++;
                if (i < len) {
                    sendJSONPackets(url, results, i, len);
                }
                else {
                    setTimeout(onSQLJSONPics, 1000);
                    // close();

                }

            });
        }
        else {
            setTimeout(onSQLJSONPics, 1000);
        }

    }


    function sendGPS() {
        var geolocTask;
        var getGeopositionPromise;
        var geolocator = new Windows.Devices.Geolocation.Geolocator();
        getGeopositionPromise = geolocator.getGeopositionAsync();
        getGeopositionPromise.done(
            function (pos) {
                var coord = pos.coordinate;

                var validity;
                var accuracy = coord.accuracy;

                if (accuracy > 60.0) {
                    validity = "2";
                }
                else if (accuracy > 0 && accuracy < 61.0) {
                    validity = "1";
                }
                else {
                    validity = "0";
                }

                var myDate = new Date();
                //construct date string in DD/MM/YYYY HH24:MI:SS format
                var newDate = ("0" + myDate.getDate()).slice(-2) + "/" + ("0" + (myDate.getMonth() + 1)).slice(-2) + "/" + myDate.getFullYear() + " " + myDate.toLocaleTimeString('en-GB');

                //construct date string to DDMMYYHH24MISS format
                var gpsDate = ("0" + myDate.getDate()).slice(-2) + ("0" + (myDate.getMonth() + 1)).slice(-2) + myDate.getFullYear().toString().substr(2, 2) + myDate.toLocaleTimeString('en-GB').replace(/\:/g, "");
                var gps = "STD," + validity + "," + gpsDate + "," + coord.point.position.latitude + "," + coord.point.position.longitude + ",?";

                var myObj = {};
                myObj["device"] = uuid;
                myObj["dttm"] = newDate;
                myObj["gps"] = gps;
                myObj["latitude"] = "" + coord.point.position.latitude;
                myObj["longitude"] = "" + coord.point.position.longitude;
                myObj["validity"] = validity;
                myObj["altitude"] = coord.point.position.altitude;




                var jsonData = JSON.stringify(myObj);


                ajax.post(url, {
                    method: "GPS",
                    data: jsonData
                }, function (d) {
                    var data = JSON.parse(d);


                });

            },
            function (err) {
                console.log(err.message, "sample", "error");
            }
        );
    }

    //
    // Start the timer function to simulate background task work.
    //

    setTimeout(onSQLJSONPackets, 1000);*/
})();