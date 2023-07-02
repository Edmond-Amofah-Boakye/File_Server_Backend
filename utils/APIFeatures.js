class APIFeatures{
    constructor(query, queryString){
      this.query = query,
      this.queryString = queryString
    }

    //filtering
    filter(){
      const qryObject = { ...this.queryString}
      const excludeFields = ["page", "sort", "limit", "fields"]
      excludeFields.forEach((field)=>{
      delete(qryObject[field])
    })
      this.query.find(qryObject)
      return this
    }

    //sorting
    sort(){
      if(this.queryString.sort){
        this.query = this.query.sort(this.queryString)
      }else{
        this.query = this.query.sort('-createdAt')
      }
      return this
    }

    
    //pagination
    pagination(){
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 50;
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
      return this
    }

  }

  export default APIFeatures;