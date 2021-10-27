const notFound = (req, res) => {
  res.status(404).send('Sorry, this route does not exist')
}

module.exports = notFound
