import { Box, Center, Input } from '@chakra-ui/react';

import { Route, Routes, Link } from 'react-router-dom';
import { InputGroup } from 'ui-components';

export function App() {
  return (
    <>
      <Center>
        <Box>
          <InputGroup>
            <Input type="text" name="email" placeholder="email" />
          </InputGroup>
        </Box>
      </Center>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
