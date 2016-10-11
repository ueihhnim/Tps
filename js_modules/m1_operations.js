// var fs = require('fs');
exports.Message_write = function (account, path) {
  load_gmail_stuff(account, (userId, access_token) => {
      gmail_messages_list(userId, access_token, 1000000, '',(response) => {
          // Loop through all message id in response.message to get single message and write them to diskd
          for (let message of response.messages) {
              gmail_messages_get(userId, access_token, message.id, (single_message) => {
                  fs.writeFile(path + '/' + single_message.id, JSON.stringify(single_message), (err) => {
                      if (err) throw err;
                      console.log('Message saved!');
                  });
              });
          };
      })
  })
};

exports.Pass_message_to_React = function (message) {
  var title = message.payload.headers.find(x=>x.name = 'Subject').value;
  return title;
}

exports.Get_path_and_dir = function (doc, callback) {
  var sp = doc.user_account_type;
  var user_account_name = doc.user_account_name;
  var path = './base/content/' + sp + '__' + user_account_name;
  var result = [];
  fs.readdir(path, (err, files)=>{
    if (!err) {
      for (let file of files) {
        var x = JSON.parse(fs.readFileSync(path + '/' + file));
        result.push(x);
      }
      return callback(result.reverse());
    }
  });
}

exports.Fetching_new_message = function (account, query, me) {
  if (!account) return;
  var path = './base/content/' + account.user_account_type + '__' + account.user_account_name;
  var data = me.state.data;
  var data_update = [];
  load_gmail_stuff(account, (userId, access_token) => {
    gmail_messages_list(userId, access_token, 100, query, (response) =>{
      for (let message of response.messages) {
          gmail_messages_get(userId, access_token, message.id, (single_message) => {
            if ((data.length > 0 && single_message.id != data[0]['id']) || me.state.data.length == 0) {
              data_update.unshift(single_message);
              fs.writeFile(path + '/' + single_message.id, JSON.stringify(single_message), (err) => {
                  if (err) throw err;
                  console.log('New Message Saved!');
                  me.setState({data: data_update.reverse().concat(data)});
              });
            }
          });
      };
    })
  })
}


module.id = 'M1';
