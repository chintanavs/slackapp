var moment=require('moment');

var generateMessage=(from,text)=>{
  return{
    text,
    from,
    createdAt:moment().valueOf()
  };
};

var generateLocationMessage=(from,latitude,longitude)=>{
  return {
    from,
    createdAt:moment().valueOf(),
    url:`https://www.google.com/maps?q=${latitude},${longitude}`
  };
};

module.exports={generateMessage,generateLocationMessage};
