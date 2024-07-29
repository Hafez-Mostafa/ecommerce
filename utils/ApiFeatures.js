export default class ApiFeatures {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    pagination() {
        let page = this.queryString.page * 1 || 1;
        if (page < 1) page = 1;
        let limit = 2;
        let skip = (page - 1) * limit;
        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
        return this;
    }

    filter() {
        let excludeQuery = ["page", "select", "filter", "sort"];
        let filterQuery = { ...this.queryString }; // deep copy
        excludeQuery.forEach(el => delete filterQuery[el]);
        
        filterQuery = JSON.parse(
            JSON.stringify(filterQuery).replace(/(gt|lt|gte|lte|eq)/g, match => `$${match}`)
        );
        
        this.mongooseQuery = this.mongooseQuery.find(filterQuery);
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.replace(/,/g, " ");
            this.mongooseQuery = this.mongooseQuery.sort(sortBy);
        }
        return this;
    }

    select() {
        if (this.queryString.select) {
            const fields = this.queryString.select.replace(/,/g, " ");
            this.mongooseQuery = this.mongooseQuery.select(fields);
        }
        return this;
    }

    search() {
        if (this.queryString.search) {
            this.mongooseQuery = this.mongooseQuery.find({
                $or: [
                    { title: { $regex: this.queryString.search, $options: "i" } },
                    { description: { $regex: this.queryString.search, $options: "i" } }
                ]
            });
        }
        return this;
    }
}
