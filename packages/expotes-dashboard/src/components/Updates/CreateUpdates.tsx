import {
  Button,
  Card,
  Container,
  Spacer,
  Text,
  Upload,
} from '@nextui-org/react'
import React, { useState } from 'react'

const UpdatesForm = () => {
  const [file, setFile] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle file upload logic here
    console.log('File to upload:', file)
  }

  return (
    <Container>
      <Card>
        <Card.Body>
          <Text h2>Upload Update File</Text>
          <Spacer y={1} />
          <form onSubmit={handleSubmit}>
            <Upload accept="image/*,.pdf" onChange={handleFileChange}>
              <Text>
                {file
                  ? file.name
                  : 'Drag and drop your file here or click to select'}
              </Text>
            </Upload>
            <Spacer y={1} />
            <Button type="submit" disabled={!file}>
              Upload
            </Button>
          </form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default UpdatesForm
