const restrictAccessTo = (...roles) =>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(res.status(401).send("not authorised to access this resource"))
        }

        next()
    }
}

export default restrictAccessTo;