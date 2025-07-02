import React from 'react'
import { selectSelectedSchool } from '../store/slices/authSlice';
import { useSelector } from 'react-redux';

const SchoolSelectionIndicator = ({children}) => {
    /*get school from selector*/
      const selectedSchool = useSelector(selectSelectedSchool);
  return (
   /*a popup that alerts the user that they need to select a school*/
    <div className="school-selection-indicator">
      {selectedSchool ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
            <strong>Válassz iskolát a bal felső sarokban!</strong>
            <br />
            <span className="small-text">Az iskolaválasztás szükséges a funkciók eléréséhez.</span>
        </div>
      )}

    </div>
  )
}

export default SchoolSelectionIndicator