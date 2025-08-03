import React from 'react';

const ContinueWatching = ({ history }) => {
  return (
    <div className="d-flex flex-row overflow-auto gap-3">
      {history.map((item, idx) => (
        <div className="card" style={{ width: '200px' }} key={idx}>
          <div className="card-body">
            <h6 className="card-title">{item.title}</h6>
            <div className="progress">
              <div className="progress-bar" role="progressbar" style={{ width: `${item.progress}%` }}>
                {item.progress}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContinueWatching;
